import React from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FilmGrain from './components/FilmGrain';
import Landing from './pages/Landing';
import Stories from './pages/Stories';
import Write from './pages/Write';
import Auth from './pages/Auth';
import Letters from './pages/Letters';
import Love from './pages/Love';
import Thoughts from './pages/Thoughts';
import Music from './pages/Music';
import Books from './pages/Books';
import Occult from './pages/Occult';
import Healing from './pages/Healing';
import My from './pages/My';
import Guidelines from './pages/Guidelines';
import Admin from './pages/Admin';
import Explore from './pages/Explore';
import BackButton from './components/BackButton';

import DayLayout from './layouts/DayLayout';
import DayLanding from './pages/DayLanding';
import DayRooms from './pages/DayRooms';
import DayRoomDetail from './pages/DayRoomDetail';

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
    );
  }

  return (
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
  );
}
