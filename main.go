package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/leekool/x_md/template"
	"github.com/leekool/x_md/utils/markd"
	"github.com/leekool/x_md/utils/x"
	// "github.com/leekool/x_md/utils/x"
)

type RenderRequest struct {
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

	template.NewTemplateRenderer(e, "public/*.html")

	e.GET("/", func(c echo.Context) error {
		return c.Render(http.StatusOK, "index", nil)
	})

	e.POST("/x/input", func(c echo.Context) error {
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

	e.POST("/x/markdown", func(c echo.Context) error {
		body, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		parts := strings.SplitN(string(body), "=", 2)
		value := parts[1]

		xJson, err := x.FetchX(value)
		if err != nil {
			return err
		}

		x, err := x.ParseCdnJson(xJson)
		if err != nil {
			return err
		}

		jsonData, err := json.Marshal(x)
		if err != nil {
			return err
		}

		fmt.Println("/x/markdown")
		fmt.Printf("JSON: %+v\n", string(jsonData))

		res := map[string]interface{}{
			"ParsedMarkdown": string(jsonData),
		}

		return c.Render(http.StatusOK, "x", res)
	})

	e.POST("/editor/render", func(c echo.Context) error {
		var payload RenderRequest

		err := c.Bind(&payload)
		if err != nil {
			return err
		}

		parsed, err := markd.ParseMD(payload.Content)
		if err != nil {
			return err
		}

		res := map[string]interface{}{
			"ParsedMarkdown": parsed,
		}
		return c.Render(http.StatusOK, "markdown", res)
	})

	e.Logger.Fatal(e.Start(":4040"))
}
