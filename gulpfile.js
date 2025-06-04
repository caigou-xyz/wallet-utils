const gulp = require("gulp");
const ts = require("gulp-typescript");
const SRC_PATH = "src";

const BUILD_MODE = {
  ESM: {
    PATH: "es",
  },
  CJS: {
    PATH: "lib",
  },
};

// TypeScript projects for different module systems
const tsProjectCJS = ts.createProject("tsconfig.json", {
  module: "commonjs",
  outDir: "./lib"
});

const tsProjectESM = ts.createProject("tsconfig.json", {
  module: "esnext",
  moduleResolution: "node",
  outDir: "./es",
  declaration: false  // Only generate declarations in CJS build
});

gulp.task("build-esm", () => {
  return gulp
    .src([`${SRC_PATH}/**/*.ts`])
    .pipe(tsProjectESM())
    .pipe(gulp.dest(BUILD_MODE.ESM.PATH));
});

gulp.task("build-cjs", () => {
  return gulp
    .src([`${SRC_PATH}/**/*.ts`])
    .pipe(tsProjectCJS())
    .pipe(gulp.dest(BUILD_MODE.CJS.PATH));
});

const CURRENT_MODE = BUILD_MODE[process.env.BABEL_ENV?.toUpperCase()];
if (CURRENT_MODE == BUILD_MODE.ESM) {
  gulp.task("build", gulp.series("build-esm"));
} else if (CURRENT_MODE == BUILD_MODE.CJS) {
  gulp.task("build", gulp.series("build-cjs"));
}
