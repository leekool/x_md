package x

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
)

type Media struct {
	URL      string `json:"url"`
	Base64   string `json:"base64"`
	FileType string `json:"fileType"`
}

type Tweet struct {
	UserName    string   `json:"userName"`
	DisplayName string   `json:"displayName"`
	ID          string   `json:"id"`
	CreateDate  string   `json:"createDate"`
	Text        string   `json:"text"`
	Media       *[]Media `json:"media,omitempty"`
	// Quote       *Tweet  `json:"quote"`
}

func FetchX(input string) (map[string]interface{}, error) {
	id, err := ValidateId(input)
	if err != nil {
		return nil, fmt.Errorf("failed to validate ID: %w", err)
	}

	url := "http://cdn.syndication.twimg.com/tweet-result?id=" + id + "&token=a"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")
	req.Header.Set("Referer", "https://web.archive.org/web"+time.Now().Format("20060102150405")+url)
	req.Header.Set("sec-ch-ua-platform", "\"Windows\"")
	req.Header.Set("sec-ch-ua", "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"")
	req.Header.Set("sec-ch-ua-mobile", "?0")
	req.Header.Set("DNT", "1")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var jsonResponse map[string]interface{}
	err = json.Unmarshal(body, &jsonResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to parse JSON response: %w", err)
	}

	return jsonResponse, nil
}

func ValidateId(input string) (string, error) {
	re := regexp.MustCompile(`(^|[^0-9])(\d{17,20})([^0-9]|$)`)
	match := re.FindStringSubmatch(input)

	if len(match) < 3 {
		return "", errors.New("no valid ID found in input")
	}

	return match[2], nil
}

func ParseJsonMarkdown(t Tweet) string {
	md := fmt.Sprintf(`
author: "%s"
handle: "%s"
date: "%s"

%s`, t.UserName, t.DisplayName, t.CreateDate, t.Text)

	if t.Media != nil && len(*t.Media) > 0 {
		for _, m := range *t.Media {
			// md += fmt.Sprintf("\n<img alt=\"%s\" src=\"data:image/%s;base64,%s\" />", m.URL, m.FileType, m.Base64)
			md += fmt.Sprintf("\n![%s](data:image/%s;base64,%s)", m.URL, m.FileType, m.Base64)
		}
	}

	return md
}

func ParseCdnJson(json map[string]interface{}) (*Tweet, error) {
	userData, ok := json["user"].(map[string]interface{})
	if !ok {
		return nil, errors.New("missing or invalid 'user' object")
	}

	userName, err := getKey[string](userData, "screen_name")
	if err != nil {
		return nil, err
	}

	displayName, err := getKey[string](userData, "name")
	if err != nil {
		return nil, err
	}

	id, err := getKey[string](json, "id_str")
	if err != nil {
		return nil, err
	}

	createDate, err := getKey[string](json, "created_at")
	if err != nil {
		return nil, err
	}

	text, err := getKey[string](json, "text")
	if err != nil {
		return nil, err
	}

	media, err := getMedia(json)
	if err != nil {
		// fmt.Printf("getMedia %s", err)
	}

	return &Tweet{
		UserName:    userName,
		DisplayName: displayName,
		ID:          id,
		CreateDate:  createDate,
		Text:        text,
		Media:       media,
	}, nil
}

func getMedia(json map[string]interface{}) (*[]Media, error) {
	media, ok := json["mediaDetails"].([]interface{})
	if !ok {
		return nil, errors.New("missing or invalid 'mediaDetails' object")
	}

	var buf []Media

	for _, item := range media {
		m, ok := item.(map[string]interface{})
		if !ok {
			fmt.Print("invalid 'mediaDetails' entry")
			continue
		}

		url, ok := m["media_url_https"].(string)
		if !ok {
			fmt.Printf("missing or invalid 'media_url_https': %s", url)
			continue
		}

		if idx := strings.Index(url, "https"); idx != -1 {
			url = url[:4] + url[5:] // https -> http
		}

		charIndex := strings.LastIndex(url, ".")
		if charIndex == -1 {
			fmt.Printf("invalid URL, no file extension: %s", url)
			continue
		}

		fileType := url[charIndex+1:]
		if fileType == "jpg" {
			fileType = "jpeg"
		}

		base64, err := fetchMediaBase64(url)
		if err != nil {
			fmt.Printf("failed to fetch media: %s", err)
			continue
		}

		buf = append(buf, Media{
			URL:      url,
			Base64:   base64,
			FileType: fileType,
		})
	}

	return &buf, nil
}

func fetchMediaBase64(url string) (string, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")
	req.Header.Set("Referer", "https://web.archive.org/web"+time.Now().Format("20060102150405")+url)
	req.Header.Set("sec-ch-ua-platform", "\"Windows\"")
	req.Header.Set("sec-ch-ua", "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"")
	req.Header.Set("sec-ch-ua-mobile", "?0")
	req.Header.Set("DNT", "1")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	base64 := base64.StdEncoding.EncodeToString(body)
	return base64, nil
}

func getKey[T any](data map[string]interface{}, key string) (T, error) {
	value, ok := data[key]
	if !ok {
		var zero T
		return zero, errors.New("missing key")
	}

	typedValue, ok := value.(T)
	if !ok {
		var zero T
		return zero, errors.New("key is not correct type")
	}

	return typedValue, nil
}

// fn getQuote(tweet: *Tweet, x_tweet: std.json.Value, a: std.mem.Allocator) !void {
//     const quote_obj = x_tweet.object.get("quoted_tweet");
//     if (quote_obj == null) return;
//
//     const id = quote_obj.?.object.get("id_str").?.string;
//
//     const quoted_tweet = try Tweet.init(a, id);
//     const quote_ptr = try a.create(Tweet);
//
//     quote_ptr.* = quoted_tweet;
//     tweet.quote = quote_ptr;
// }
