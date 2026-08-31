import { HttpContextToken } from '@angular/common/http';

/**
 * HttpContext token used to opt an HTTP request out of the global spinner
 * overlay (e.g. requests whose loading state is instead represented by a
 * page-level skeleton).
 */
export const SKIP_SPINNER = new HttpContextToken<boolean>(() => false);
