"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import FlowBackground from "@/components/flow-background";

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

const valuePoints = [
  {
    title: "레거시 이해 시간 단축",
    content:
      "코드 히스토리와 PR 맥락을 함께 읽어, 새 팀원이 핵심 구조를 빠르게 파악할 수 있도록 돕습니다."
  },
  {
    title: "AI 사수 기반 온보딩",
    content:
      "막히는 순간마다 질문 가능한 대화형 컨텍스트를 제공해, 인수인계 누락 구간을 실시간으로 보완합니다."
  },
  {
    title: "팀 지식의 연속성 확보",
    content:
      "개인의 기억이 아닌 팀 단위의 지식 자산으로 축적해 프로젝트 품질과 의사결정 일관성을 유지합니다."
  }
];

const highlightStats = [
  { label: "Context Coverage", value: "95%" },
  { label: "Onboarding Delay", value: "-60%" },
  { label: "Async Q&A Access", value: "24/7" }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden text-zinc-100">
      <section className="hermes-hero relative isolate min-h-screen">
        <FlowBackground />

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
            className="mt-20 grid max-w-6xl gap-10 sm:mt-28 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm tracking-[0.12em] text-zinc-200">
                TEAM 커서야호~
              </div>
              <p className="text-[clamp(2rem,3.8vw,3rem)] font-semibold leading-[1.35] text-zinc-100">
                떠난 개발자의 흔적에서, 새로운 개발자의 답을 찾다.
              </p>
              <p className="max-w-2xl text-xl leading-relaxed text-zinc-200">
                HERMES는 전임 개발자의 소스코드, 커밋 로그, PR 기록을 완벽하게
                학습하여 복잡한 레거시 분석 비용을 최소화합니다. 인수인계 누수로
                인한 지식 공백을 메우고, 새로 합류한 개발자가 눈치 보지 않고 24시간
                언제든 질문할 수 있는 AI 사수 환경을 제공합니다.
                <br />
                단순한 코드 분석을 넘어 맥락을 잇고 팀의 연속적인 성장을 돕는
                파트너가 되겠습니다.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {valuePoints.map((point) => (
                  <article
                    key={point.title}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
                  >
                    <h3 className="text-base font-semibold tracking-wide text-zinc-100 sm:text-lg">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-300 sm:text-base">
                      {point.content}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-glass backdrop-blur-sm">
              <p className="text-base tracking-[0.16em] text-zinc-300">
                HERMES SNAPSHOT
              </p>
              <div className="mt-6 space-y-5">
                {highlightStats.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-end justify-between border-b border-white/10 pb-3"
                  >
                    <span className="text-base text-zinc-300 sm:text-lg">{item.label}</span>
                    <span className="text-3xl font-semibold tracking-wide text-zinc-100">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-base leading-relaxed text-zinc-200 sm:text-lg">
                인수인계의 공백을 데이터 기반 대화로 치환해, 팀의 개발 속도와
                코드 이해도를 동시에 끌어올립니다.
              </p>
            </div>
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
