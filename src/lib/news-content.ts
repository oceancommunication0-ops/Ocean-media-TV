export type { NewsArticle, ArticleSummary } from '../../shared/content'
export type NewsCategory = string
import type { ArticleSummary } from '../../shared/content'
export function newsImageSources(article: ArticleSummary) { return article.imageSrcSet }
