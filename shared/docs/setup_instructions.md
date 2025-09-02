# Setup Instructions for Development Environment

This document outlines all the requirements and step-by-step instructions to set up your development environment efficiently. Follow these steps to avoid stalling issues and ensure smooth development and deployment.

---

## **1. Install VS Code Extensions**

Install the following extensions in Visual Studio Code:

1. **ESLint** (`dbaeumer.vscode-eslint`):
   - Ensures code quality and linting.
   - Install via VS Code Marketplace or run:
     ```bash
     code --install-extension dbaeumer.vscode-eslint
     ```

2. **Prettier - Code Formatter** (`esbenp.prettier-vscode`):
   - For consistent code formatting.
   - Install via VS Code Marketplace or run:
     ```bash
     code --install-extension esbenp.prettier-vscode
     ```

3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`):
   - Provides IntelliSense for Tailwind CSS (optional).
   - Install via VS Code Marketplace or run:
     ```bash
     code --install-extension bradlc.vscode-tailwindcss
     ```

4. **Prisma** (`Prisma.prisma`):
   - For working with Prisma schema.
   - Install via VS Code Marketplace or run:
     ```bash
     code --install-extension Prisma.prisma
     ```

5. **REST Client** (`humao.rest-client`):
   - For testing API endpoints.
   - Install via VS Code Marketplace or run:
     ```bash
     code --install-extension humao.rest-client
     ```

6. **DotENV** (`mikestead.dotenv`):
   - Syntax highlighting for `.env` files.
   - Install via VS Code Marketplace or run:
     ```bash
     code --install-extension mikestead.dotenv
     ```

7. **TypeScript Hero** (`rbbit.typescript-hero`):
   - Manages TypeScript imports.
   - Install via VS Code Marketplace or run:
     ```bash
     code --install-extension rbbit.typescript-hero
     ```

8. **Vercel** (`vercel.vercel`):
   - For deploying and managing Vercel projects.
   - Install via VS Code Marketplace or run:
     ```bash
     code --install-extension vercel.vercel
     ```

9. **GitLens** (`eamodio.gitlens`):
   - Enhanced Git integration.
   - Install via VS Code Marketplace or run:
     ```bash
     code --install-extension eamodio.gitlens
     ```

10. **Path IntelliSense** (`christian-kohler.path-intellisense`):
    - Autocompletes file paths.
    - Install via VS Code Marketplace or run:
      ```bash
      code --install-extension christian-kohler.path-intellisense
      ```

11. **Jest** (`Orta.vscode-jest`):
    - For testing with Jest.
    - Install via VS Code Marketplace or run:
      ```bash
      code --install-extension Orta.vscode-jest
      ```

12. **Markdown All in One** (`yzhang.markdown-all-in-one`):
    - For working with Markdown files.
    - Install via VS Code Marketplace or run:
      ```bash
      code --install-extension yzhang.markdown-all-in-one
      ```

---

## **2. Install Global Tools**

Run the following commands in your terminal to install the required global tools:

1. **Node.js**:
   - Download and install the latest LTS version from [Node.js](https://nodejs.org/).

2. **npm**:
   - Ensure npm is updated:
     ```bash
     npm install -g npm
     ```

3. **npx**:
   - Comes with npm, no additional installation required.

4. **TypeScript**:
   - Install globally:
     ```bash
     npm install -g typescript
     ```

5. **Vercel CLI**:
   - Install globally:
     ```bash
     npm install -g vercel
     ```

6. **Prisma CLI**:
   - Install globally:
     ```bash
     npm install -g prisma
     ```

7. **ESLint CLI**:
   - Install globally:
     ```bash
     npm install -g eslint
     ```

8. **Prettier CLI**:
   - Install globally:
     ```bash
     npm install -g prettier
     ```

---

## **3. Local Project Dependencies**

These dependencies are already included in your project setup:

- **Next.js**: Installed via `create-next-app`.
- **Express**: For server-side functionality.
- **Axios**: For HTTP requests.
- **dotenv**: For environment variable management.
- **React Query**: For state management.
- **TypeScript**: For type safety.
- **@types/...**: Type definitions for Node.js, React, and Express.

---

## **4. Deployment to Vercel**

1. **Create a Vercel Account**:
   - Sign up at [Vercel](https://vercel.com/).

2. **Install Vercel CLI**:
   - Run:
     ```bash
     npm install -g vercel
     ```

3. **Deploy Your Project**:
   - Navigate to your project folder and run:
     ```bash
     vercel deploy
     ```

4. **Set Environment Variables**:
   - Configure your `.env` file locally.
   - Add the same variables in the Vercel dashboard under the "Environment Variables" section.

---

## **5. Optional Tools**

1. **Postman**:
   - For testing APIs. Download from [Postman](https://www.postman.com/).

2. **Insomnia**:
   - Another API testing tool. Download from [Insomnia](https://insomnia.rest/).

3. **Docker**:
   - If you plan to containerize your application. Download from [Docker](https://www.docker.com/).

4. **Git**:
   - For version control. Download from [Git](https://git-scm.com/).

---

## **6. Install Pandoc**

Pandoc is required for converting Markdown to Word documents and vice versa. Follow these steps to install it:

1. **Using Chocolatey** (Recommended):
   - Open a terminal with **Administrator privileges**.
   - Run the following command:
     ```bash
     choco install pandoc -y
     ```

2. **Manual Installation**:
   - Visit the [Pandoc download page](https://pandoc.org/installing.html).
   - Download the installer for your operating system (Windows).
   - Run the installer and follow the instructions.

---

## **7. Set Vercel Access Token**

The Vercel Access Token is required for deploying and managing your projects. Follow these steps to set it:

1. **For the Current Session Only**:
   - Run the following command in your terminal:
     ```bash
     export VERCEL_ACCESS_TOKEN=EauUfTdXTN4LPJ0CV2YINJfy
     ```

2. **For Persistent Use**:
   - Add the token to your shell configuration file (e.g., `~/.bashrc`, `~/.bash_profile`, or `~/.zshrc`):
     ```bash
     export VERCEL_ACCESS_TOKEN=EauUfTdXTN4LPJ0CV2YINJfy
     ```
   - Save the file and reload the shell configuration:
     ```bash
     source ~/.bashrc
     ```

---

## **8. Install @modelcontextprotocol/sdk**

The `@modelcontextprotocol/sdk` package is required for interacting with the Model Context Protocol (MCP). Follow these steps to install it:

1. **Install Globally** (Recommended):
   - Run the following command in your terminal:
     ```bash
     npm install -g @modelcontextprotocol/sdk
     ```

2. **Install Locally** (If needed for a specific project):
   - Navigate to your project directory and run:
     ```bash
     npm install @modelcontextprotocol/sdk
     ```
