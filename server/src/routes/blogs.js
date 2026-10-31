import { Router } from 'express';
import { authenticate, enforcePasswordChange } from '../middleware/auth.js';
import { searchLimiter } from '../middleware/limiters.js';
import { validate } from '../utils/http.js';
import * as S from '../validators/blogSchemas.js';
import * as blogs from '../controllers/blogs.js';
import { blogUpload } from '../middleware/upload.js';

const router=Router();
const query=validate(S.blogQuery,'query');
router.get('/sitemap.xml',blogs.sitemap); router.get('/rss.xml',blogs.rss);
router.get('/featured',blogs.featured); router.get('/popular',blogs.popular); router.get('/latest',blogs.latest);
router.get('/search',searchLimiter,query,blogs.search); router.get('/category/:slug',query,blogs.byCategory); router.get('/tag/:tag',query,blogs.byTag);
router.get('/:slug/related',blogs.related); router.post('/:slug/view',searchLimiter,blogs.trackView); router.get('/:slug',blogs.getBySlug); router.get('/',query,blogs.listPublic);
export default router;
