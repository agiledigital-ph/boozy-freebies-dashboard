## bzy-freebies-dashboard
Front-end codebase of Boozy Freebie Promo App.

## Techstack
- Svelte - Front-end framework
- Flowbite-Svelte - Component library
- TailwindCSS - CSS framework 

## Getting Started
### Pre-requisite
- Install Firebase CLI tool.

```
npm install firebase tools cli
```
- Login your firebase account using these commands.

```
firebase login:add sample@example.com
firebase login:use sample@example.com
```
- Put .env.production and .env.development on the root directory

  
### Local Development
- Fork and clone the repository.
- Install packages.
- Run command to run in your local device.
```
npm run dev
```

### Deployment
For production environment, run these commands.
```
- npm run build
- gcloud auth configure-docker asia-east2-docker.pkg.dev
- docker buildx build --platform linux/amd64 -t boozy-freebie-dashboard .
- docker tag boozy-freebie-dashboard asia-east2-docker.pkg.dev/boozy-freebie/boozy-freebie-dashboard/boozy-freebie-dashboard
- docker push  asia-east2-docker.pkg.dev/boozy-freebie/boozy-freebie-dashboard/boozy-freebie-dashboard
```

### Contribution
- Use the github commit and push command.
- Create a pull request from forked repository to main repository.
