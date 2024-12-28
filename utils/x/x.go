package x

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
)

type Media struct {
	URL      string
	Base64   string
	FileType string
}

type Tweet struct {
	UserName    string
	DisplayName string
	ID          string
	CreateDate  string
	Text        string
	Media       []Media
	Quote       *Tweet
}

func FetchX(id string) (string, error) {
	start := "http://cdn.syndication.twimg.com/tweet-result?id="
	end := "&token=a"
	url := start + id + end

	resp, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	return string(body), nil
}

func ValidateId(input string) (string, error) {
	re := regexp.MustCompile(`(^|[^0-9])(\d{17,20})([^0-9]|$)`)
	match := re.FindStringSubmatch(input)

	if len(match) < 3 {
		return "", errors.New("no valid ID found in input")
	}

	return match[2], nil
}
