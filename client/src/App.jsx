import { Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout.jsx';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute.jsx';
import Home from './pages/Home.jsx';
import Catalogue from './pages/Catalogue.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Legal from './pages/Legal.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminCatalogue from './pages/AdminCatalogue.jsx';
import AdminBookForm from './pages/AdminBookForm.jsx';
import AdminCategories from './pages/AdminCategories.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminEnquiries from './pages/AdminEnquiries.jsx';
import AdminSettings from './pages/AdminSettings.jsx';
import { ADMIN_PATHS, ADMIN_ROUTE_SEGMENTS } from './routes/adminRoutes.js';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="catalogue" element={<Catalogue />} />
        <Route path="catalogue/:slug" element={<ProductDetails />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Legal kind="privacy" />} />
        <Route path="terms" element={<Legal kind="terms" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path={ADMIN_PATHS.login} element={<AdminLogin />} />
      <Route path={ADMIN_PATHS.dashboard} element={<ProtectedAdminRoute />}>
        <Route index element={<AdminDashboard />} />
        <Route path={ADMIN_ROUTE_SEGMENTS.catalogue} element={<AdminCatalogue />} />
        <Route path={ADMIN_ROUTE_SEGMENTS.newBook} element={<AdminBookForm />} />
        <Route path={ADMIN_ROUTE_SEGMENTS.editBook} element={<AdminBookForm />} />
        <Route path={ADMIN_ROUTE_SEGMENTS.categories} element={<AdminCategories />} />
        <Route path={ADMIN_ROUTE_SEGMENTS.orders} element={<AdminOrders />} />
        <Route path={ADMIN_ROUTE_SEGMENTS.enquiries} element={<AdminEnquiries />} />
        <Route path={ADMIN_ROUTE_SEGMENTS.settings} element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
