export const APP_NAME = "墨风记账";
export const APP_VERSION = "1.1.3";
export const GITHUB_REPOSITORY = "Cmochance/MoBill";
export const GITHUB_URL = `https://github.com/${GITHUB_REPOSITORY}`;
export const GITHUB_RELEASES_API = `${GITHUB_URL.replace(
  "https://github.com",
  "https://api.github.com/repos",
)}/releases?per_page=20`;

export interface ReleaseUpdateInfo {
  version: string;
  title: string;
  body: string;
  publishedAt?: string;
  releaseUrl?: string;
  downloadUrl?: string;
  downloadName?: string;
}

export type VersionCheckResult =
  | {
      status: "current";
      latestVersion: string;
      releaseUrl?: string;
      message: string;
    }
  | {
      status: "available";
      latestVersion: string;
      updates: ReleaseUpdateInfo[];
      downloadUrl?: string;
      downloadName?: string;
      message: string;
    }
  | {
      status: "unavailable" | "error";
      message: string;
    };

function normalizeVersion(value: string) {
  return value.trim().match(/\d+(?:\.\d+)*/)?.[0] || "";
}

function compareVersion(left: string, right: string) {
  const leftParts = normalizeVersion(left)
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = normalizeVersion(right)
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] || 0;
    const rightPart = rightParts[index] || 0;
    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }

  return 0;
}

interface GitHubReleaseAsset {
  name?: string;
  browser_download_url?: string;
}

interface GitHubRelease {
  tag_name?: string;
  name?: string;
  body?: string;
  html_url?: string;
  published_at?: string;
  draft?: boolean;
  prerelease?: boolean;
  assets?: GitHubReleaseAsset[];
}

function selectDownloadAsset(assets: GitHubReleaseAsset[] = []) {
  const downloadableAssets = assets.filter(
    (asset) => asset.name && asset.browser_download_url,
  );
  const preferredPatterns = [
    /\.apk$/i,
    /\.dmg$/i,
    /\.pkg$/i,
    /\.exe$/i,
    /\.msi$/i,
    /\.zip$/i,
  ];

  for (const pattern of preferredPatterns) {
    const asset = downloadableAssets.find((item) => pattern.test(item.name!));
    if (asset) return asset;
  }

  return downloadableAssets[0];
}

function toReleaseUpdateInfo(release: GitHubRelease): ReleaseUpdateInfo | null {
  const version = normalizeVersion(release.tag_name || release.name || "");
  if (!version) return null;

  const asset = selectDownloadAsset(release.assets);

  return {
    version,
    title: release.name || `v${version}`,
    body: release.body?.trim() || "此版本未填写更新说明。",
    publishedAt: release.published_at,
    releaseUrl: release.html_url,
    downloadUrl: asset?.browser_download_url,
    downloadName: asset?.name,
  };
}

export async function checkForAppUpdate(): Promise<VersionCheckResult> {
  try {
    const response = await fetch(GITHUB_RELEASES_API, {
      headers: {
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return {
        status: "unavailable",
        message: "暂未找到 GitHub Release，当前无法判断是否有新版本。",
      };
    }

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const releases = ((await response.json()) as GitHubRelease[])
      .filter((release) => !release.draft && !release.prerelease)
      .map(toReleaseUpdateInfo)
      .filter((release): release is ReleaseUpdateInfo => Boolean(release))
      .sort((left, right) => compareVersion(left.version, right.version));

    if (releases.length === 0) {
      return {
        status: "unavailable",
        message: "已连接 GitHub，但暂未找到可识别的版本信息。",
      };
    }

    const newerReleases = releases.filter(
      (release) => compareVersion(release.version, APP_VERSION) > 0,
    );
    const latestRelease = releases[releases.length - 1];

    if (newerReleases.length > 0) {
      const latestNewRelease = newerReleases[newerReleases.length - 1];
      return {
        status: "available",
        latestVersion: latestNewRelease.version,
        updates: newerReleases,
        downloadUrl: latestNewRelease.downloadUrl,
        downloadName: latestNewRelease.downloadName,
        message: `发现 ${newerReleases.length} 个新版本，最新为 v${latestNewRelease.version}`,
      };
    }

    return {
      status: "current",
      latestVersion: latestRelease.version,
      releaseUrl: latestRelease.releaseUrl,
      message: "当前已是最新版本",
    };
  } catch {
    return {
      status: "error",
      message: "版本检测失败，请稍后重试。",
    };
  }
}
