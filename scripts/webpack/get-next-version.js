const { execSync } = require('child_process');
const conventionalRecommendedBump = require('conventional-recommended-bump');
const semver = require('semver');

const packageJson = require('../../package.json');

function getNextVersion() {
    return new Promise((resolve, reject) => {
        // If the current commit is the latest tagged commit, just return current
        // version because there is no new commit ahead of it.
        if (execSync('git describe').toString().trim() === `v${packageJson.version}`) {
            return resolve(packageJson.version);
        }

        // Otherwise, determine the next version based on the commit messages.
        conventionalRecommendedBump({ preset: 'angular' }, (err, release) => {
            if (err) {
                return reject(err);
            }

            // For pre-releases, append the commit hash to the version number to
            // ensure that the version number is always unique.
            if (process.env.PRERELEASE) {
                const prereleaseType = ['alpha', 'beta'].includes(process.env.PRERELEASE) ? process.env.PRERELEASE : 'alpha';

                return resolve(
                    semver.inc(packageJson.version, 'prerelease', prereleaseType)
                        .replace(/\.\d+$/, '.' + execSync('git rev-parse HEAD').toString().trim())
                );
            }

            resolve(semver.inc(packageJson.version, release.releaseType));
        });
    });
}

module.exports = getNextVersion;
