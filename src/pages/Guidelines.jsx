import React from 'react';
import PageBackground from '../components/PageBackground';
import revealTextTree from '../components/TextReveal';
import { Shield, HeartHandshake, Eye, AlertOctagon, Scale, Sparkles } from 'lucide-react';

export default function Guidelines() {
  const sections = [
    {
      icon: <Shield className="w-5 h-5 text-white" />,
      title: '1. No Harassment, Doxxing, or Hate',
      desc: 'Never share phone numbers, physical addresses, real full names, social media handles, or any identifiable personal details of yourself or anyone else. We are here to release feelings, not to target or expose individuals.',
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-white" />,
      title: '2. Support, Not Harm',
      desc: 'We strictly prohibit any encouragement of self-harm, eating disorders, or suicide. Sharing personal pain and past trauma is welcomed, but graphic instructions or methods will be immediately flagged and removed. If you are in crisis, please call Tele-MANAS at 14416 (free, 24/7 in India) or visit findahelpline.com.',
    },
    {
      icon: <AlertOctagon className="w-5 h-5 text-white" />,
      title: '3. Cults & The Occult: Experiences Only',
      desc: 'The Dark Corner exists to discuss high-control groups, cult aftermaths, and strange experiences. It is strictly forbidden to share ritual instructions, spellcasting recipes, sacrifice methods, or recruitment links. All posts in this section are closely monitored.',
    },
    {
      icon: <Scale className="w-5 h-5 text-white" />,
      title: '4. No Clinical or Medical Advice',
      desc: 'Members may share what helped their own journey (such as grounding techniques, walking, therapy experiences, or music), but no user may prescribe medications, provide psychiatric diagnoses, or pose as licensed practitioners.',
    },
    {
      icon: <Eye className="w-5 h-5 text-white" />,
      title: '5. Respect the Blur (Content Warnings)',
      desc: 'When writing about grief, trauma, or distressing events, toggle the Content Warning switch. This places a gentle protective blur over your words so readers can choose when they feel emotionally prepared to read.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-white" />,
      title: '6. Argue with Ideas, Never People',
      desc: 'In Perspectives, thoughtful disagreement is welcomed. Question arguments, challenge assumptions, and offer counter-evidence with calm grace. Insults, mocking, or personal hostility have no home in this sanctuary.',
    },
  ];

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-03.jpg" />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-left">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl sm:text-6xl text-white text-aura mb-2">
            Community Guidelines
          </h1>
          <p className="text-zinc-200 text-sm sm:text-base max-w-lg mx-auto">
            Our quiet pact to keep this space warm, non-judgmental, and safe.
          </p>
        </div>

        {/* Guidelines List */}
        <div className="flex flex-col gap-5">
          {sections.map((sec, idx) => (
            <div
              key={idx}
              className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/15 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 rounded-full bg-white/10 shrink-0">
                  {sec.icon}
                </div>
                <h2 className="font-serif text-xl sm:text-2xl text-white text-aura">
                  {sec.title}
                </h2>
              </div>
              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed pl-12 font-normal">
                {sec.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Helpline Note */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/20 mt-8 text-center">
          <h3 className="font-serif text-2xl text-white mb-2">Need to talk to a human right now?</h3>
          <p className="text-xs text-zinc-300 max-w-md mx-auto mb-4">
            If what you are carrying is overwhelming, please reach out to free, trained crisis counselors.
          </p>
          <a
            href="tel:14416"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all"
          >
            <span>Call Tele-MANAS (14416)</span>
          </a>
        </div>
      </div>
    </div>
  ));
}
