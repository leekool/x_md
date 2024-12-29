package main

import (
	// "encoding/json"
	// "fmt"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	t "github.com/leekool/x_md/template"
	"github.com/leekool/x_md/utils/markd"
	"github.com/leekool/x_md/utils/x"
)

type EditorInputRequest struct {
	Content string `json:"content" form:"content"`
}

func main() {
	e := echo.New()

	// e.Pre(middleware.RemoveTrailingSlash())
	// e.Use(middleware.Recover())
	// e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(
	// 	rate.Limit(20),
	// )))

	e.Static("/dist", "dist")

	t.NewTemplateRenderer(e, "public/*.html")

	view := "preview"
	var md string
	var html template.HTML

	e.GET("/", func(c echo.Context) error {
		return c.Render(http.StatusOK, "index", nil)
	})

	e.POST("/id/input", func(c echo.Context) error {
		body, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		valid := false
		parts := strings.SplitN(string(body), "=", 2)
		value := parts[1]

		_, err = x.ValidateId(value)
		if err == nil {
			valid = true
		}

		res := map[string]interface{}{
			"valid": valid,
		}

		return c.Render(http.StatusOK, "submit_button", res)
	})

	e.POST("/editor/submit", func(c echo.Context) error {
		body, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return fmt.Errorf("failed to read body: %w", err)
		}

		parts := strings.SplitN(string(body), "=", 2)
		value := parts[1]

		tweetCdn, err := x.FetchX(value)
		if err != nil {
			return fmt.Errorf("failed to fetch tweet: %w", err)
		}

		tweet, err := x.ParseCdnJson(tweetCdn)
		if err != nil {
			return fmt.Errorf("failed to parse tweet JSON to MD: %w", err)
		}

		tweetMd := strings.TrimSpace(x.ParseJsonMarkdown(*tweet))
		md = tweetMd

		tweetHtml, err := markd.ParseMD(tweetMd)
		if err != nil {
			return fmt.Errorf("failed to parse tweet MD to HTML: %w", err)
		}
		html = tweetHtml

		fmt.Println(view)

		res := map[string]interface{}{
			"ParsedX":     md,
			"ParsedInput": html,
			"View":        view,
		}

		return c.Render(http.StatusOK, "editor_preview", res)
	})

	// e.POST("/editor/input", func(c echo.Context) error {
	// 	body, err := io.ReadAll(c.Request().Body)
	// 	if err != nil {
	// 		return fmt.Errorf("failed to read body: %w", err)
	// 	}
	//
	// 	fmt.Println(string(body))
	//
	// 	return c.Render(http.StatusOK, "", nil)
	// })

	e.POST("/editor/input", func(c echo.Context) error {
		var payload EditorInputRequest

		err := c.Bind(&payload)
		if err != nil {
			return fmt.Errorf("failed to read body: %w", err)
		}

		fmt.Print(payload.Content)
		md = payload.Content

		parsedHtml, err := markd.ParseMD(payload.Content)
		if err != nil {
			return fmt.Errorf("failed to parse body: %w", err)
		}
		html = parsedHtml

		res := map[string]interface{}{
			"ParsedInput": html,
		}
		return c.Render(http.StatusOK, "preview", res)
	})

	e.POST("/editor/view", func(c echo.Context) error {
		body, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return fmt.Errorf("failed to read body: %w", err)
		}

		parts := strings.SplitN(string(body), "=", 2)
		value := parts[1]
		view = value

		res := map[string]interface{}{
			"ParsedX":     md,
			"ParsedInput": html,
			"View":        view,
		}

		return c.Render(http.StatusOK, "editor_preview", res)
	})

	e.Logger.Fatal(e.Start(":4040"))
}
