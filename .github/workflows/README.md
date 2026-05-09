# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for automated testing, deployment, and monitoring of the Dreamscape backend.

## ⚠️ **STATUS: CI/CD PIPELINES CURRENTLY DISABLED**

All workflows have been temporarily disabled by renaming with `.disabled` extension.

**To enable**: Remove `.disabled` extension from workflow files:
```bash
cd .github/workflows
for file in *.yml.disabled; do mv "$file" "${file%.disabled}"; done
git add .
git commit -m "feat: Enable CI/CD pipelines"
git push origin backend
```

## 🚀 Workflows (Currently Disabled)

### 1. **Backend to Main Pipeline** (`backend-to-main.yml`)
**Trigger**: Automatic on push to `backend` branch

**What it does**:
- ✅ Runs comprehensive tests
- ✅ Validates configuration files
- ✅ Merges `backend` branch to `main` if tests pass
- ✅ Creates deployment tags
- ✅ Triggers Vercel production deployment
- ✅ Sends deployment notifications

**Usage**:
```bash
# Just push to backend branch
git push origin backend
# The rest is automatic!
```

### 2. **CI Pipeline** (`ci.yml`)
**Trigger**: Push to any branch, Pull Requests

**What it does**:
- ✅ Tests on multiple Go versions (1.24, 1.25)
- ✅ Security scanning with Gosec
- ✅ Configuration validation
- ✅ Code formatting checks

**Usage**:
- Runs automatically on every push and PR
- Provides immediate feedback on code quality

### 3. **Manual Deployment** (`manual-deployment.yml`)
**Trigger**: Manual via GitHub Actions UI

**What it does**:
- ✅ Deploy to specific environment (production/staging/development)
- ✅ Optional test skipping
- ✅ Git tag creation
- ✅ Rollback capabilities

**Usage**:
1. Go to Actions tab in GitHub
2. Select "Manual Deployment"
3. Click "Run workflow"
4. Choose options and run

### 4. **Health Check & Monitoring** (`health-check.yml`)
**Trigger**: Hourly schedule + manual

**What it does**:
- ✅ API health checks
- ✅ Configuration integrity monitoring
- ✅ Dependency security scanning
- ✅ Outdated dependency detection

**Usage**:
- Runs automatically every hour
- Can be triggered manually for immediate checks

## 📋 Deployment Process

### Automatic Deployment (Recommended)

1. **Development**: Work on `backend` branch
   ```bash
   git checkout backend
   # Make changes
   git add .
   git commit -m "feat: new feature"
   git push origin backend
   ```

2. **Testing**: CI/CD runs automatically
   - Runs tests
   - Validates configurations
   - Checks code quality

3. **Deployment**: If tests pass
   - Merges to `main` automatically
   - Creates deployment tag
   - Triggers Vercel deployment

4. **Production**: Live on Vercel
   - Automatic deployment to production
   - Health checks monitor status

### Manual Deployment

For special cases (hotfixes, rollbacks):

1. Go to GitHub → Actions → Manual Deployment
2. Run workflow with desired options
3. Monitor deployment progress

## 🔧 Configuration

### Required Secrets
No additional secrets needed for basic functionality.

### Environment Variables
Set in repository settings:
- `VERCEL_URL`: Your Vercel deployment URL
- `WEBHOOK_URL`: Optional Slack/Discord webhook for notifications

### Workflow Permissions
All workflows have required permissions:
- `contents: write` - For merging and tagging
- `pull-requests: write` - For PR operations

## 🛡️ Safety Features

### Automated Tests
- Unit tests with race detection
- Integration tests
- Security vulnerability scanning
- Configuration validation

### Rollback Capabilities
- Automatic rollback on failure
- Manual rollback workflow
- Previous version tracking
- Deployment tags for easy rollback

### Monitoring
- Hourly health checks
- Configuration integrity monitoring
- Dependency security scanning
- Deployment status notifications

## 📊 Monitoring

### GitHub Actions Dashboard
- Real-time workflow status
- Deployment history
- Test results
- Security scan results

### Health Check Results
- API availability
- Response times
- Error rates
- Configuration status

## 🚨 Troubleshooting

### Pipeline Fails
1. Check Actions tab for error details
2. Fix issues in `backend` branch
3. Push fixes - automatic retry

### Deployment Issues
1. Check Vercel deployment logs
2. Use manual deployment for control
3. Rollback if needed using manual workflow

### Health Check Failures
1. Review API status
2. Check Vercel dashboard
3. Review recent deployments

## 📈 Best Practices

1. **Branch Strategy**: Always work on `backend` branch
2. **Testing**: Ensure tests pass before pushing
3. **Configuration**: Validate JSON files before commit
4. **Monitoring**: Check health check results regularly
5. **Rollback**: Know how to rollback if needed

## 🔄 Workflow Status

- ✅ **Backend to Main**: Active
- ✅ **CI Pipeline**: Active
- ✅ **Manual Deployment**: Available
- ✅ **Health Check**: Active (hourly)

## 📞 Support

For issues with CI/CD:
1. Check GitHub Actions logs
2. Review workflow documentation
3. Check Vercel deployment status
4. Contact team if issues persist

---

**Note**: These workflows are designed for safe, automated deployments. Always monitor the first few automatic deployments to ensure they work as expected!