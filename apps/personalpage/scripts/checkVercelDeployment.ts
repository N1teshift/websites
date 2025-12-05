/**
 * Utility script to check Vercel deployment status
 * 
 * Usage:
 *   - With Vercel API token: VERCEL_TOKEN=xxx npm run check:vercel
 *   - With browser automation: npm run check:vercel -- --browser
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
  createdAt: number;
  buildingAt?: number;
  readyAt?: number;
}

interface VercelDeploymentResponse {
  deployments: VercelDeployment[];
}

/**
 * Check deployment status using Vercel API
 */
async function checkViaAPI(projectName: string, teamId?: string): Promise<void> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    console.error('❌ VERCEL_TOKEN environment variable is required for API method');
    console.log('💡 Get your token from: https://vercel.com/account/tokens');
    process.exit(1);
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Get project deployments
    const projectUrl = teamId
      ? `https://api.vercel.com/v6/deployments?project=${projectName}&teamId=${teamId}&limit=1`
      : `https://api.vercel.com/v6/deployments?project=${projectName}&limit=1`;

    const response = await axios.get<VercelDeploymentResponse>(projectUrl, { headers });
    const deployments = response.data.deployments;

    if (deployments.length === 0) {
      console.log('⚠️  No deployments found');
      return;
    }

    const latest = deployments[0];
    const status = latest.state;
    const statusEmoji = {
      BUILDING: '🔨',
      ERROR: '❌',
      INITIALIZING: '⏳',
      QUEUED: '⏸️',
      READY: '✅',
      CANCELED: '🚫',
    }[status] || '❓';

    console.log(`\n${statusEmoji} Latest Deployment Status: ${status}`);
    console.log(`   URL: ${latest.url}`);
    console.log(`   Created: ${new Date(latest.createdAt).toLocaleString()}`);
    
    if (latest.readyAt) {
      console.log(`   Ready: ${new Date(latest.readyAt).toLocaleString()}`);
    }

    if (status === 'ERROR') {
      console.log('\n❌ Deployment failed!');
      process.exit(1);
    } else if (status === 'READY') {
      console.log('\n✅ Deployment successful!');
      process.exit(0);
    } else {
      console.log(`\n⏳ Deployment is ${status.toLowerCase()}...`);
      process.exit(0);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ API Error:', error.response?.data?.error?.message || error.message);
      if (error.response?.status === 401) {
        console.error('💡 Check that your VERCEL_TOKEN is valid');
      }
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

/**
 * Get project name from package.json or git remote
 */
function getProjectName(): string {
  // Try to get from package.json
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkgContent = fs.readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgContent);
    return pkg.name || 'personalpage';
  } catch {
    // Default fallback
    return 'personalpage';
  }
}

// Main execution
const args = process.argv.slice(2);
const useBrowser = args.includes('--browser');

if (useBrowser) {
  console.log('🌐 Browser automation mode');
  console.log('💡 This would require browser automation tools');
  console.log('💡 For now, use the API method with VERCEL_TOKEN');
  process.exit(0);
} else {
  const projectName = getProjectName();
  const teamId = process.env.VERCEL_TEAM_ID;
  checkViaAPI(projectName, teamId);
}

