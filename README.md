# Markdown Translator and Reviewer

[![CI](https://github.com/trystan2k/md-translator-reviewer/actions/workflows/ci.yml/badge.svg)](https://github.com/trystan2k/md-translator-reviewer/actions/workflows/ci.yml)

Powered by: [![Google](https://img.shields.io/badge/-Google%20gemini-white?style=flat-square&logo=googlegemini&color=grey)](https://ai.google/discover/generativeai/)
[![Vercel AI](https://img.shields.io/badge/-Vercel%20AI-white?style=flat-square&logo=vercel&color=grey)](https://sdk.vercel.ai/)
[![OpenAI](https://img.shields.io/badge/-OpenAI-white?style=flat-square&logo=openai&color=grey)](https://platform.openai.com/)

- [📍 Overview](#-overview)
- [📦 Providers](#-providers)
- [👾 Features](#-features)
  - [Security](#security)
  - [Functionality](#functionality)
  - [Code Quality](#code-quality)
  - [Testing](#testing)
  - [Dependencies](#dependencies)
- [🚀 Getting Started](#-getting-started)
  - [Permissions](#permissions)
  - [API Key](#api-key)
  - [Workflow File](#workflow-file)
  - [Usage](#usage)
  - [Supported Languages](#supported-languages)
- [🏗️ Building the Project](#️-building-the-project)
  - [Installation](#installation)
  - [Build](#build)
  - [Tests](#tests)
- [🤝 Contributing](#-contributing)
- [👥 Contributor Graph](#contributor-graph)
- [🎗 License](#-license)
- [🔖 References](#-references)

---

## 📍 Overview

Markdown Translator and Reviewer is a GitHub Action that leverages Generative AI to streamline the review process for markdown files. The action enables users to translate markdown files into multiple languages, generate review suggestions, and automatically apply these suggestions to the code. It utilizes a robust command parsing system, ensuring user input is correctly interpreted and executed. By integrating AI-powered translation and review capabilities, the action simplifies the collaborative process, allowing developers to focus on content while the action handles language barriers and provides insightful feedback.

## 📦 Providers

The action supports multiple AI providers for translation and review suggestions:

- **Google Generative AI API**: The action integrates with Google's Generative AI API for translation and review suggestions.
- **Vercel AI Google API**: The action integrates with Vercel AI Google API for translation and review suggestions.
- **Vercel AI OpenAI API**: The action integrates with Vercel AI OpenAI API for translation and review suggestions.

The action can be configured to use any of the available providers by specifying the provider name in the workflow file (into the `aiProvider` property). The provider name should be one of the following:

- `google`: Google Generative AI API
- `vercel-ai-google`: Vercel AI Google API
- `vercel-ai-openai`: Vercel AI OpenAI API

---

## 👾 Features

### Security

- **Permissions**: The commands (translate, review and apply-review) can only be executed by users with **write permissions** to the repository.

### Functionality

The command supports the following commands that can handle markdown (.md) and markdown-jsx (.mdx) files:

- **Translation**: The action translates markdown files into multiple languages, enabling global collaboration and communication.
- **Review**: The action review the markdown file where the command is add as a comment and highlighting potential improvements and areas for enhancement.
- **Apply Review**: The action applies the review suggestions to the markdown files where the command is add as a comment.

### Code Quality

- **TypeScript**: The action is developed using TypeScript, ensuring type safety and code consistency.
- **ESLint and Prettier**: The codebase adheres to best practices using ESLint and Prettier for consistent code formatting.
- **Unit Tests**: The action includes unit tests to validate the correctness of individual functions and modules.

### Testing

- **Jest**: The action utilizes Jest for testing, ensuring the reliability and accuracy of the codebase.
- **Code Coverage**: The action maintains a high code coverage percentage, guaranteeing comprehensive testing.

### Dependencies

- **Google Generative AI API**: The action integrates with Google's Generative AI API for translation and review suggestions.
- **Vercel AI**: The action integrates with Vercel AI for translation and review suggestions.
- **GitHub API**: The action interacts with the GitHub API to access and modify markdown files within repositories.

---

## 🚀 Getting Started

To use the Markdown Translator and Reviewer action, it is necessary to configure the required permissions and API keys. Later you need to create a workflow file in your repository to trigger the action.

### Permissions

It is necessary to enable `Read and write permissions` for the GitHub Token in the repository settings. This permission is required to access and modify markdown files within the repository.

1. Navigate to the repository `Settings`.
2. Expand the `Actions` section and click on `General`
3. Scroll down to the `Permissions` section and ensure that the `Read and write permissions` are enabled for the GitHub Token.

### API Key

To use the action, you need to obtain an API key for the choosen Provider. Follow these steps to create an API key:

#### Google Generative AI API

To use the Google Generative AI API, you need to create an API key. Follow these steps to create an API key:

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Login with your Google account.
3. [Create an API key](https://aistudio.google.com/app/apikey). Note that in Europe the free tier is not available.

#### Vercel AI API

To use the any Vercel AI API provider, you need to create an API key for that specific provider. For example, if you want to use Vercel AI Google API as provider, you need to provide a Google AI api key generated in Google's AI page.

##### Vercel AI Google API

To use the Vercel AI Google API, you need to create an API key. Follow these steps to create an API key:

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Login with your Google account.
3. [Create an API key](https://aistudio.google.com/app/apikey). Note that in Europe the free tier is not available.

##### Vercel AI OpenAI API

To use the Vercel AI OpenAI API, you need to create an API key. Follow these steps to create an API key:

1. Go to [OpenAI](https://platform.openai.com/).
2. Login with your OpenAI account.
3. [Create an API key](https://platform.openai.com/account/api-keys).

Once you have obtained the API key, add it to the repository secrets as `AI_API_KEY` (for any of the provider selected, use the same variable).

1. Navigate to the repository `Settings`.
2. Expand the `Secrets and variables` section and click on `Actions`.
3. Click on `New repository secret`.
4. Add the
   - `Name`: `AI_API_KEY`
   - `Value`: `<Your API Key>`

### Workflow File

Create a new workflow file in your repository to trigger the Markdown Translator and Reviewer action. The workflow file should be placed in the `.github/workflows` directory.

> [!IMPORTANT]
>
> To the workflow work correctly, you need to configure it to only run on a specific event named `pull_request_review_comment` and type `created`. This event is triggered when a user creates a review comment on a pull request file, so the action has the reference to the file that needs to be translated or reviewed.
> Also, configure it to only run when the comment contains the command `/mtr-` to avoid unnecessary executions.

#### Inputs

The action requires the following inputs:

| Name                       | Required    | Default Value         | Description                                                                     |
| -------------------------- | ----------- | --------------------- | ------------------------------------------------------------------------------- |
| token                      | true        | `${{ github.token }}` | The GitHub token to access the repository.                                      |
| aiApiKey                   | true        |                       | The API key for the selected AI provider.                                       |
| aiProvider                 | true        | `google`              | The name of the AI provider to use (google, vercel-ai-google, vercel-ai-openai).|
| aiModel                    | false       | `gemini-1.5-flash`    | The AI model to use for the translation.                                        |

Example of a workflow file:

```yaml
name: Markdown Translator and Reviewer Workflow

on:
  # Execute when a comment is created in a file of a pull request
  pull_request_review_comment:
    types: [ created ]

jobs:
  md-translator-reviewer:
    runs-on: ubuntu-latest
    name: A job to run the Markdown Reviwer and Translator
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Run Markdown Translator and Reviewer
        # Only run the action when the comment contains the command '/mtr-'
        if: |
          contains(github.event.comment.body, '/mtr-')
        uses: trystan2k/markdown-translator-reviewer@v1
        with:
          aiApiKey: ${{ secrets.AI_API_KEY }}
          aiProvider: 'google' # current available providers: google, vercel-ai-google, vercel-ai-openai
          aiModel: 'gemini-1.5-flash'
```

### Usage

Once everything is configured in place, to trigger the action, create a review comment in a pull request file containing the command `/mtr-` followed by the desired action and parameters. The action and parameters should be separated by spaces. The action can be one of the following

- `translate`: Translates the markdown file into the specified language, creating and pushing to the branch a new file with the translated content and naming it with the language name.

   Example: `/mtr-translate spanish` translates the markdown file into Spanish, generating a new file named `<origina-file-name>-spanish.md(x)`.

- `review`: Reviews the markdown file, providing suggestions, via comment reply, and highlighting areas for improvement.

   Example: `/mtr-review` reviews the markdown file.

- `apply-review`: Once a commend with review suggestions is created, reply to this comment quoting it (you can even remove or add new suggestions, following the format) with this command to apply the review suggestions.

   Example: `/mtr-apply-review` applies the review suggestions, updating and pushing the markdown file to the branch.

### Supported Languages

The action supports any language available in the available AI providers (see section [Providers](#-providers)).

## 🏗️ Building the Project

Ensure you have Node.js and PNPM installed on your machine before proceeding with the installation.

```sh
❯ node -v
>= 20.0.0

❯ pnpm -v
>= 9.9.0
```

### Installation

Build the project from source:

1. Clone the repository:

```sh
❯ git clone git@github.com:trystan2k/md-translator-reviewer.git
```

2. Navigate to the project directory:

```sh
❯ cd md-translator-reviewer
```

3. Install the required dependencies:

```sh
❯ pnpm install
```

### Build

To build the project for distribution, run the following command:

```sh
❯ pnpm build
```

### Tests

Execute the test suite using the following command:

```sh
❯ pnpm test
```

---

## 🤝 Contributing

Contributions are welcome! Here are several ways you can contribute:

- **[Report Issues](https://github.com/trystan2k/md-translator-reviewer/issues)**: Submit bugs found or log feature requests for the `app` project.
- **[Submit Pull Requests](/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

---

## Contributor Graph

<p align="left">
   <a href="https://github.com/trystan2k/md-translator-reviewer/graphs/contributors">
      <img src="https://contrib.rocks/image?repo=trystan2k/md-translator-reviewer" />
   </a>
</p>

---

## 🎗 License

This project is protected under the [MIT](https://choosealicense.com/licenses/mit/) License. For more details, refer to the [LICENSE](/LICENSE) file.

---

## 🔖 References

### GitHub Actions

- [GitHub Actions](https://docs.github.com/en/actions)

### AI

- [Google Generative AI API](https://ai.google.dev/gemini-api/docs)
- [Google Generative AI API SDK](https://www.npmjs.com/package/@google/generative-ai)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Fine-tuning AI Models Insights: Temperature, Top-p, Top-k](https://www.linkedin.com/pulse/fine-tuning-ai-models-insights-temperature-top-p-top-k-nicola-tamboia-ub43f/)

---
