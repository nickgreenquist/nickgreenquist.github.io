# drafts/

Unpublished content kept in the repo but **deliberately not built or served**.

`drafts/` lives outside the Astro content collection (the blog loader's `base` is
`./src/content/blog`), so nothing here is loaded, built, routed, or included in the
RSS feed. These files are version-controlled only — they will never appear on the
live site until explicitly migrated into `src/`.

## blog/

The ML "from scratch" series recovered (June 2026) from the old Jekyll blog repo's
git history (`github.com/nickgreenquist/blog`, deleted in commit `98e4bf0`,
2021-02-28). Posts are in their **original Jekyll/kramdown form** — they have NOT
yet had the Jekyll-isms converted (Liquid `absolute_url`, kramdown image attrs,
MathJax/`<style>` blocks, `eqnarray`/`equation` LaTeX). See "Blog migration notes"
in `CLAUDE.md` for the conversion recipe.

### posts/ (12 files)

| File | Title |
|------|-------|
| 2019-04-13-gradient_descent.md | Gradient Descent for Linear Regression |
| 2019-04-15-ridge_regression.md | Ridge Regression / L2 |
| 2019-04-18-SGD.md | Stochastic Gradient Descent |
| 2020-08-29-Softmax.md | Softmax: Partial Derivative |
| 2020-08-30-SVM_Math.md | SVM from Scratch, Part I (Math) |
| 2020-09-01-SVM_Code.md | SVM from Scratch, Part II (Code) |
| 2020-09-05-kernel_ridge_regression_math.md | Kernelized Ridge Regression (Math) |
| 2020-09-07-kernel_ridge_regression_code.md | Kernelized Ridge Regression Part II (Code) |
| 2020-09-10-kernel_ridge_regression_code.md | Kernelized SVM (short stub) |
| 2020-09-30-multiclass_classification.md | Multiclass Classification with SVM |
| 2020-10-01-decision-trees.md | Decision Tree from Scratch |
| 2020-10-05-gradient-boosting-machines.md | Gradient Boosting |

### assets/ (7 dirs)

Image directories referenced by the posts above (`GradientDescent`, `Kernels`,
`Multiclass`, `RidgeRegression`, `SGD`, `Softmax`, `SVM`).

## To publish a post

1. Convert the Jekyll-isms (see `CLAUDE.md` → "Blog migration notes").
2. Add the frontmatter schema fields (`title`, `description`, `date` as `YYYY-MM-DD`,
   `slug`, `category`, optional `image`) — see existing posts in `src/content/blog/`.
3. Move the `.md` into `src/content/blog/` and copy any referenced asset dir into
   `public/blog/assets/`.

The listing, post route, RSS feed, and URL all derive automatically once it's in the
collection.
