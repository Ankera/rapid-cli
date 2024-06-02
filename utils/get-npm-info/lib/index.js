'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

function getNpmInfo (npmName, registry) {
  if (!npmName) {
    return null;
  }
  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName);

  // @ts-ignore
  return axios.get(npmInfoUrl).then((response) => {
    if (response.status === 200) {
      return response.data;
    }
    return null;
  }).catch((err) => {
    return Promise.reject(err);
  })
}

function getDefaultRegistry (isRegistry = false) {
  return isRegistry ? 'https://registry.npm.taobao.org/' : 'https://registry.npmjs.org/'
}

/**
 * 获取 npm 上所有版本号
 * @param {*} npmName 
 * @param {*} registry 
 */
async function getNpmVersions (npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions)
  } else {
    return []
  }
}

/**
 * 线上 npm 版本号和本地对比，获取大于本地版本号的线上版本号
 * @param {*} baseVersion 
 * @param {*} versions 
 */
function getSemverVersions (baseVersion, versions) {
  versions = versions
    .filter((version) => semver.satisfies(version, `>${baseVersion}`))
    .sort((a, b) => semver.gt(b, a));
  return versions;
}

async function getNpmSemverVersions (baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getSemverVersions(baseVersion, versions);
  if (newVersions && Array.isArray(newVersions) && newVersions.length > 0) {
    return newVersions[0];
  }
  return null;
}

async function getNpmLatestVersion (npmName, registry) {
  let versions = await getNpmVersions(npmName, registry);
  if (versions) {
    // @ts-ignore
    versions = versions.sort((a, b) => semver.gt(b, a));
    return versions[0];
  }
  return null;
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersions,
  getDefaultRegistry,
  getNpmLatestVersion
}

