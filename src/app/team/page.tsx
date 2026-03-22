"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import { getTeamMembers, type TeamMember } from "@/lib/team";
import { Users } from "lucide-react";

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamMembers().then((t) => { setTeam(t); setLoading(false); });
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center">
        <Image src="/images/interior-living-wide.webp" alt="Our Team" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 text-center text-white px-6">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.5em] uppercase mb-5 text-white/70">The People Behind ANEW</p>
            <h1 className="font-heading text-5xl sm:text-6xl font-normal">Our Team</h1>
          </AnimatedSection>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <div className="divider mx-auto mb-8" />
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal mb-6 leading-tight">
              Warm Faces,<br />Strong Foundations
            </h2>
            <p className="text-muted text-base leading-relaxed max-w-xl mx-auto">
              ANEW is built by people who believe that the best experiences come from genuine care, deep knowledge, and a love for this land. Get to know the team that makes it all happen.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Team Members */}
      <section className="pb-28 px-6">
        <div className="max-w-[1200px] mx-auto">
          {loading ? (
            <p className="text-muted text-sm text-center py-12">Loading team...</p>
          ) : team.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-10 h-10 text-accent mx-auto mb-4" />
              <h2 className="font-heading text-2xl text-dark mb-3">Team Profiles Coming Soon</h2>
              <p className="text-muted text-sm max-w-md mx-auto">We&apos;re putting together our team page. Check back soon to meet the people behind ANEW.</p>
            </div>
          ) : (
            <div className="space-y-28">
              {team.map((member, i) => (
                <AnimatedSection key={member.id} delay={0.1}>
                  <div className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center`}>
                    <div className={`relative aspect-[4/3] overflow-hidden bg-cream ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                      {member.imageUrl ? (
                        <Image src={member.imageUrl} alt={member.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-16 h-16 text-border" />
                        </div>
                      )}
                    </div>
                    <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                      <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-3">{member.role}</p>
                      <h3 className="font-heading text-3xl text-dark mb-5 font-normal">{member.name}</h3>
                      <p className="text-muted text-[15px] leading-relaxed">{member.bio}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="py-28 bg-cream px-6">
        <div className="max-w-3xl mx-auto text-center">
          <AnimatedSection>
            <p className="text-[11px] tracking-[0.4em] uppercase text-accent mb-4">Our Values</p>
            <h2 className="font-heading text-3xl sm:text-4xl text-dark font-normal mb-12">What Guides Us</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-3 gap-10 text-left">
            {[
              { title: "Intentional Hospitality", desc: "Every detail is considered — from the welcome to the farewell. We host with purpose and care." },
              { title: "Rooted in Nature", desc: "The land shapes everything we do. We honor the environment and let the natural setting lead." },
              { title: "Fresh Beginnings", desc: "ANEW means starting fresh. We create space for new memories, new connections, and new perspectives." },
            ].map((v, i) => (
              <AnimatedSection key={v.title} delay={i * 0.1}>
                <h4 className="font-heading text-xl text-dark mb-2">{v.title}</h4>
                <p className="text-sm text-muted leading-relaxed">{v.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="text-center max-w-lg mx-auto">
          <AnimatedSection>
            <h2 className="font-heading text-3xl text-dark mb-4 font-normal">We&apos;d Love to Meet You</h2>
            <p className="text-muted text-sm mb-8">Schedule a tour and get to know the team behind ANEW in person.</p>
            <Link href="/#contact" className="text-[11px] tracking-[0.3em] uppercase bg-dark text-white px-8 py-3.5 hover:bg-accent transition-colors duration-500">
              Schedule a Tour
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
