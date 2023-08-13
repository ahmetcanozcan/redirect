const fs = require("fs/promises");
const path = require("path");
const { Buffer } = require("buffer");

const buildFolder = "build";

const buildRedirectHTMLBuff = (url) =>
  new Uint8Array(
    Buffer.from(`<meta http-equiv="refresh" content="0; url=${url}" />`)
  );

const writeRediretion = ({ name, url }) =>
  fs.writeFile(filePath(name), buildRedirectHTMLBuff(url));

const ensureBuildFoler = () =>
  fs.mkdir(buildFolder).catch((e) => {
    if (!e || (e && e.code === "EEXIST")) return;
    throw e;
  });

const cleanBuildDir = () =>
  fs
    .readdir(buildFolder)
    .then((files) => files.map((f) => fs.unlink(path.join(buildFolder, f))));

const filePath = (name) => path.join(buildFolder, `${name}.html`);

const createRedirectionFiles = () => {
  const redirects = process.env.REDIRECTS.split(";")
    .map((v) => v.split("="))
    .map(([name, url]) => ({ name, url }));

  const jobs = redirects.map(writeRediretion);

  if (!jobs || jobs.length == 0) {
    throw Error("no redirection defined!");
  }

  return Promise.all(jobs);
};

ensureBuildFoler().then(cleanBuildDir).then(createRedirectionFiles);
