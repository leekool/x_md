package x

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"time"
)

type Media struct {
	URL      string `json:"url"`
	Base64   string `json:"base64"`
	FileType string `json:"fileType"`
}

type Tweet struct {
	UserName    string  `json:"userName"`
	DisplayName string  `json:"displayName"`
	ID          string  `json:"id"`
	CreateDate  string  `json:"createDate"`
	Text        string  `json:"text"`
	Media       []Media `json:"media"`
	Quote       *Tweet  `json:"quote"`
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
	req.Header.Set("Referer", "https://web.archive.org/web" + time.Now().Format("20060102150405") + url)
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

// fn parseTweet(x_tweet: std.json.Value, a: std.mem.Allocator) !Tweet {
//     const t = x_tweet.object;
//
//     const tweet = Tweet{
//         .userName = try a.dupe(u8, t.get("user").?.object.get("screen_name").?.string),
//         .displayName = try a.dupe(u8, t.get("user").?.object.get("name").?.string),
//         .id = try a.dupe(u8, t.get("id_str").?.string),
//         .createDate = try a.dupe(u8, t.get("created_at").?.string),
//         .text = try a.dupe(u8, t.get("text").?.string),
//     };
//
//     return tweet;
// }
//
// fn getMedia(tweet: *Tweet, x_tweet: std.json.Value, dom: *Dom, a: std.mem.Allocator) !void {
//     const media_details = x_tweet.object.get("mediaDetails");
//     if (media_details == null) return;
//
//     const media_arr = media_details.?.array;
//     if (media_arr.items.len == 0) return;
//
//     var buf = std.ArrayList(Media).init(a);
//     defer buf.deinit();
//
//     for (media_arr.items) |m| {
//         var url = m.object.get("media_url_https").?.string;
//         if (std.mem.indexOf(u8, url, "https") != null) {
//             const http = url[0..4];
//             const url_end = url[5..];
//             url = try std.mem.concat(a, u8, &[_][]const u8{ http, url_end });
//         }
//
//         try dom.getUrl(url);
//
//         // process result
//         const encoder = std.base64.standard.Encoder;
//         const base64 = try a.alloc(u8, encoder.calcSize(dom.html.?.len));
//         _ = encoder.encode(base64, dom.html.?);
//
//         var char_i = url.len;
//         while (char_i > 0) { // find last '.'
//             char_i -= 1;
//             if (url[char_i] == '.') break;
//         }
//
//         const file_type = url[char_i + 1 ..];
//
//         try buf.append(Tweet.Media{
//             .url = url,
//             .base64 = base64,
//             .fileType = file_type,
//         });
//     }
//
//     tweet.media = try buf.toOwnedSlice();
// }
//
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
