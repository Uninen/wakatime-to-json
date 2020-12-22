# WakaTime To JSON

Save your WakaTime data into a JSON file. You can run it programatically (for example with GitLab or GitHub CI) to automatically keep a JSON archive of your data.

Note: this script is not intended for fetching huge archives but small daily or weekly batches.

## Configuration

1. Get your [WakaTime Secret API key](https://wakatime.com/settings/api-key) and add it to `WAKATIME_API_KEY` environment variable (or to `.env` file in the root of your project)
2. Also set `WAKATIME_USER` to your username or user ID. (If your profile is not public, you'll find your id by clicking `View Profile` on WakaTime dashboard and copying the ID from the URL.)

## Usage

When you run `wakatime-to-json` first time, a `wakatime-data.json` file (can be overrided) is created in the same directory and all your data (provided by [WakaTime summaries API](https://wakatime.com/developers#summaries)) is saved into it as an object with days as keys. Subsequent invocations will append any new days within 14 days into this file.

If you run this from CI, you might find `--fail-when-zero` flag handy as it returns error code 1 when there are no new days found.

```
Usage: wakatime-to-json -o <filepath> [options]

Options:
  -o, --output-file <filepath>  specify where to output the data (default: "./wakatime-data.json")
  -m, --max-days <number>       specify maximum number of days to query (default: 14)
  --fail-when-zero              return exit status 1 if no new days are found
  -V, --version                 output the version number
  -h, --help                    display help for command
```

## Contributing

All contributions are welcome! Please follow the [code of conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/) when interacting with others.

[This project lives on GitLab](https://gitlab.com/uninen/wakatime-to-json) and is mirrored to GitHub.

[Follow @Uninen](https://twitter.com/uninen) on Twitter.
