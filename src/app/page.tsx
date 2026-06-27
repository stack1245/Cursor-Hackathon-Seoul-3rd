"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const teamMembers = [
  {
    name: "정진우",
    role: "팀장",
    image: "/images/team/team-leader.png",
    description:
      "안녕하세요, 제조업 품질 엔지니어로 근무중인 정진우입니다."
  },
  {
    name: "탁도형",
    role: "팀원1",
    image: "/images/team/team-member-1.png",
    description:
      "선린인터넷고등학교에 재학중인 1학년 탁도형입니다. 정보보안·개발·네트워킹을 주전공으로 두고있습니다."
  },
  {
    name: "이예빈",
    role: "팀원2",
    image: "/images/team/team-member-2.png",
    description:
      "안녕하세요, 충남대학교 인공지능학과에 재학중인 이예빈입니다."
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040507] text-zinc-100">
      <section className="hermes-hero relative isolate min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_36%,rgba(255,255,255,0.1),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.07),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-75">
          <div className="diagonal-plate absolute inset-x-[-4%] bottom-[-5%] top-[38%]" />
          <div className="diagonal-beam absolute -bottom-20 left-[38%] h-[70%] w-[42%]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-20 pt-8 sm:px-10 lg:px-14">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="HERMES Logo"
                width={126}
                height={34}
                priority
                className="h-[30px] w-auto object-contain opacity-95"
              />
              <span className="text-xl font-semibold tracking-[0.18em] text-zinc-100">
                HERMES
              </span>
            </div>
            <a
              href="#team"
              className="text-sm font-medium tracking-[0.18em] text-zinc-300 transition-colors hover:text-white"
            >
              워크스페이스
            </a>
          </header>

          <motion.div
            className="mt-24 max-w-2xl space-y-8 sm:mt-32"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="text-[clamp(1.65rem,3.3vw,2.35rem)] font-semibold leading-[1.5] text-zinc-100">
              떠난 개발자의 흔적에서, 새로운 개발자의 답을 찾다.
            </p>
            <p className="max-w-xl text-lg leading-relaxed text-zinc-300">
              HERMES는 전임 개발자의 소스코드, 커밋 로그, PR 기록을 완벽하게
              학습하여 복잡한 레거시 분석 비용을 최소화합니다. 인수인계 누수로 인한
              지식 공백을 메우고, 새로 합류한 개발자가 눈치 보지 않고 24시간 언제든
              질문할 수 있는 AI 사수 환경을 제공합니다.
              <br />
              단순한 코드 분석을 넘어 맥락을 잇고 팀의 연속적인 성장을 돕는 파트너가
              되겠습니다.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="team" className="relative z-10 bg-[#06080d]/95 py-24 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-12 flex items-end justify-between gap-6"
          >
            <h2 className="text-3xl font-semibold tracking-[0.12em] text-zinc-100 sm:text-4xl">
              TEAM 커서야호~
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
              제품 비전부터 구현까지, 팀원 각자의 전문성이 연결되어 하나의
              워크스페이스 경험을 완성합니다.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teamMembers.map((member, idx) => (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.12,
                  ease: "easeOut"
                }}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-glass backdrop-blur-sm transition-colors hover:border-white/30"
              >
                <div className="relative mb-5 h-52 overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(255,255,255,0.02))]">
                  <Image
                    src={member.image}
                    alt={`${member.role} 프로필`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-semibold tracking-wide text-zinc-100">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm uppercase tracking-[0.16em] text-zinc-400">
                  {member.role}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  {member.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
