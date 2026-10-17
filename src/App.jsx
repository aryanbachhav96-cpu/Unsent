import React, { lazy, Suspense } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FilmGrain from './components/FilmGrain';
import BackButton from './components/BackButton';

const Landing = lazy(() => import('./pages/Landing'));
const Stories = lazy(() => import('./pages/Stories'));
const Write = lazy(() => import('./pages/Write'));
const Auth = lazy(() => import('./pages/Auth'));
const Letters = lazy(() => import('./pages/Letters'));
const Love = lazy(() => import('./pages/Love'));
const Thoughts = lazy(() => import('./pages/Thoughts'));
const Music = lazy(() => import('./pages/Music'));
const Books = lazy(() => import('./pages/Books'));
const Occult = lazy(() => import('./pages/Occult'));
const Healing = lazy(() => import('./pages/Healing'));
const My = lazy(() => import('./pages/My'));
const Guidelines = lazy(() => import('./pages/Guidelines'));
const Admin = lazy(() => import('./pages/Admin'));
const Explore = lazy(() => import('./pages/Explore'));
const DayLayout = lazy(() => import('./layouts/DayLayout'));
const DayLanding = lazy(() => import('./pages/DayLanding'));
const DayRooms = lazy(() => import('./pages/DayRooms'));
const DayRoomDetail = lazy(() => import('./pages/DayRoomDetail'));

export default function App() {
  const location = useLocation();
  const isDayMode =
    location.pathname === '/' ||
    location.pathname === '/rooms' ||
    location.pathname.startsWith('/r/') ||
    location.pathname.startsWith('/day') ||
    (location.pathname === '/auth' && new URLSearchParams(location.search).get('theme') === 'day');
  const isNightLanding = location.pathname === '/night';

  if (isDayMode) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-100" />}>
        <>
          <div className="site-back-button-container fixed left-4 top-4 z-[70]">
            <BackButton mode="day" />
          </div>
          <Routes>
            <Route element={<DayLayout />}>
              <Route index element={<DayLanding />} />
              <Route path="rooms" element={<DayRooms />} />
              <Route path="r/:slug" element={<DayRoomDetail />} />
              <Route path="feed" element={<Stories mode="day" />} />
              <Route path="profile" element={<My mode="day" />} />
              <Route path="day" element={<DayLanding />} />
              <Route path="day/rooms" element={<DayRooms />} />
              <Route path="day/r/:slug" element={<DayRoomDetail />} />
              <Route path="day/feed" element={<Stories mode="day" />} />
              <Route path="day/profile" element={<My mode="day" />} />
              <Route path="auth" element={<Auth mode="day" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <div className="flex flex-col min-h-screen bg-transparent text-white relative">
        <div className="site-back-button-container fixed left-4 top-4 z-[70]">
          <BackButton />
        </div>
        <FilmGrain />
        {!isNightLanding && <Navbar />}
        <div className="flex-1 flex flex-col bg-transparent">
          <Routes>
            <Route path="/night" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/write" element={<Write />} />
            <Route path="/auth" element={<Auth mode="night" />} />
            <Route path="/letters" element={<Letters />} />
            <Route path="/love" element={<Love />} />
            <Route path="/thoughts" element={<Thoughts />} />
            <Route path="/music" element={<Music />} />
            <Route path="/books" element={<Books />} />
            <Route path="/occult" element={<Occult />} />
            <Route path="/healing" element={<Healing />} />
            <Route path="/my" element={<My />} />
            <Route path="/profile" element={<My />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/night" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Suspense>
  );
}
