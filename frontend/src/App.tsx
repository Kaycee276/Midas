import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import NotFound from './pages/NotFound';

import MerchantLogin from './pages/merchant/MerchantLogin';
import MerchantRegister from './pages/merchant/MerchantRegister';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantProfile from './pages/merchant/MerchantProfile';
import KYCSubmission from './pages/merchant/KYCSubmission';

import StudentLogin from './pages/student/StudentLogin';
import StudentRegister from './pages/student/StudentRegister';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import Portfolio from './pages/student/Portfolio';
import InvestmentDetail from './pages/student/InvestmentDetail';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import KYCReview from './pages/admin/KYCReview';

import MerchantList from './pages/public/MerchantList';
import MerchantDetail from './pages/public/MerchantDetail';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/merchants" element={<MerchantList />} />
        <Route path="/merchants/:id" element={<MerchantDetail />} />

        {/* Merchant auth */}
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/merchant/register" element={<MerchantRegister />} />

        {/* Merchant protected */}
        <Route path="/merchant/dashboard" element={<ProtectedRoute role="merchant"><MerchantDashboard /></ProtectedRoute>} />
        <Route path="/merchant/profile" element={<ProtectedRoute role="merchant"><MerchantProfile /></ProtectedRoute>} />
        <Route path="/merchant/kyc" element={<ProtectedRoute role="merchant"><KYCSubmission /></ProtectedRoute>} />

        {/* Student auth */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/register" element={<StudentRegister />} />

        {/* Student protected */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
        <Route path="/student/portfolio" element={<ProtectedRoute role="student"><Portfolio /></ProtectedRoute>} />
        <Route path="/student/investments/:id" element={<ProtectedRoute role="student"><InvestmentDetail /></ProtectedRoute>} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin protected */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/kyc/:id" element={<ProtectedRoute role="admin"><KYCReview /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
