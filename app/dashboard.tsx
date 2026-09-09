"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  BookOpenCheck,
  Building2,
  CalendarDays,
  Cloud,
  CloudRain,
  ChevronRight,
  CircleDot,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Menu,
  Newspaper,
  RefreshCw,
  Search,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  X,
} from "lucide-react";
import { refreshBriefing } from "./actions";
import type { BriefingData } from "@/src/lib/briefing";
import type { ScrapedItem, Source } from "@/src/lib/scrapers/types";
import type { WeatherSummary } from "@/src/lib/weather";

const sourceMeta: Record<Source, { label: string; short: string; tone: string }> = {
  sen_press: { label: "서울교육청 보도자료", short: "서울교육청", tone: "mint" },
  sen_notice: { label: "서울교육청 공지", short: "서울 공지", tone: "violet" },
  moe_press: { label: "교육부 보도자료", short: "교육부", tone: "blue" },
  yna: { label: "연합뉴스 교육", short: "연합뉴스", tone: "slate" },
};

const priorityTerms = ["시행령", "수능", "학교안전", "입시", "정책", "예산", "교육청", "교육부", "모집", "접수"];

function priority(item: ScrapedItem) {
  return priorityTerms.reduce((score, term) => score + (item.title.includes(term) ? 1 : 0), item.source === "moe_press" ? 2 : 0);
}

function impact(item: ScrapedItem): "high" | "medium" | "low" {
  const score = priority(item);
  return score >= 3 ? "high" : score >= 1 ? "medium" : "low";
}

function formatDate(value: string) {
  return value.replaceAll("-", ".");
}

function formatCollectedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Dashboard({ briefing, weather }: { briefing: BriefingData; weather: WeatherSummary | null }) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<Source | "all">("all");
  const [period, setPeriod] = useState<"today" | "week" | "rollingMonth">("week");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("education-briefing-favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const periodStart = useMemo(() => {
    if (period === "today") return briefing.date;
    if (period === "rollingMonth") {
      const date = new Date(new Date(`${briefing.date}T12:00:00+09:00`).getTime() - 30 * 86_400_000);
      return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
    }
    const date = new Date(`${briefing.date}T12:00:00+09:00`);
    const mondayOffset = date.getUTCDay() === 0 ? 6 : date.getUTCDay() - 1;
    date.setUTCDate(date.getUTCDate() - mondayOffset);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  }, [briefing.date, period]);
  const periodLabel = period === "today" ? "오늘" : period === "week" ? "이번 주" : "최근 한 달";
  const periodItems = useMemo(
    () => briefing.items.filter((item) => item.publishedAt >= periodStart && item.publishedAt <= briefing.date),
    [briefing, periodStart],
  );
  const topItems = useMemo(
    () => [...periodItems].sort((a, b) => priority(b) - priority(a)).slice(0, 5),
    [periodItems],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ko");
    return periodItems.filter((item) => {
      const sourceMatch = source === "all" || item.source === source;
      const textMatch = !needle || `${item.title} ${item.excerpt ?? ""}`.toLocaleLowerCase("ko").includes(needle);
      return sourceMatch && textMatch;
    });
  }, [query, source, periodItems]);

  const toggleFavorite = (url: string) => {
    const next = favorites.includes(url) ? favorites.filter((item) => item !== url) : [...favorites, url];
    setFavorites(next);
    window.localStorage.setItem("education-briefing-favorites", JSON.stringify(next));
  };

  const highImpactCount = periodItems.filter((item) => impact(item) === "high").length;
  const failedCount = briefing.sources.filter((item) => item.status === "error").length;
  const WeatherIcon = weather?.kind === "sun" ? Sun : weather?.kind === "rain" ? CloudRain : weather?.kind === "snow" ? Snowflake : Cloud;

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><BookOpenCheck size={22} /></div>
          <div><strong>서울교육 브리핑</strong><span>POLICY INTELLIGENCE</span></div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기"><X /></button>
        </div>
        <nav>
          <a className="active" href="#briefing"><LayoutDashboard /> 오늘의 브리핑</a>
          <a href="#new"><BellRing /> 기간 자료 <b>{periodItems.length}</b></a>
          <a href="#sources"><Building2 /> 기관별 현황</a>
          <a href="#impact"><ShieldCheck /> 업무 영향</a>
          <a href="#schedule"><CalendarDays /> 일정·마감</a>
          <a href="#keywords"><BarChart3 /> 정책 키워드</a>
          <a href="#favorites"><Star /> 즐겨찾기 <b>{favorites.length}</b></a>
        </nav>
        <div className="sidebar-bottom">
          <Link href="/admin/collect"><CircleDot /> 수집 상태 관리 <ChevronRight /></Link>
          <p>실제 공개 데이터 · 서버 수집</p>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="메뉴 닫기" />}

      <main className="main-content" id="briefing">
        <header className="topbar">
          <div className="headline-wrap">
            <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="메뉴 열기"><Menu /></button>
            <div><p>{briefing.date.replaceAll("-", ".")} · 서울</p><div className="title-weather"><h1 className="briefing-title"><Newspaper aria-hidden="true" />오늘의 교육계 브리핑</h1><span className="weather-chip"><WeatherIcon size={18} />{weather ? `${weather.condition} ${weather.temperature}° · 강수 ${weather.precipitationProbability}%` : "날씨 확인 불가"}</span></div></div>
          </div>
          <div className="top-actions">
            <span className={failedCount ? "health danger" : "health"}><i /> {failedCount ? `${failedCount}개 출처 오류` : "모든 출처 정상"}</span>
            <span className="updated">마지막 수집 {formatCollectedAt(briefing.collectedAt)}</span>
            <form action={refreshBriefing}><button className="refresh-button" type="submit"><RefreshCw size={17} /> 새로고침</button></form>
          </div>
        </header>

        <div className="period-switch" aria-label="조회 기간">
          <div>
            <button className={period === "today" ? "selected" : ""} onClick={() => setPeriod("today")}>오늘</button>
            <button className={period === "week" ? "selected" : ""} onClick={() => setPeriod("week")}>이번 주</button>
            <button className={period === "rollingMonth" ? "selected" : ""} onClick={() => setPeriod("rollingMonth")}>최근 한 달</button>
          </div>
          <span>{periodStart.replaceAll("-", ".")} — {briefing.date.replaceAll("-", ".")}</span>
        </div>

        <section className="stat-grid" aria-label={`${periodLabel} 통계`}>
          <article><span className="stat-icon mint"><Newspaper /></span><div><p>{periodLabel} 자료</p><strong>{periodItems.length}</strong><small>실제 게시일 기준</small></div></article>
          <article><span className="stat-icon blue"><Sparkles /></span><div><p>주요 이슈</p><strong>{topItems.length}</strong><small>규칙 기반 우선순위</small></div></article>
          <article><span className="stat-icon red"><AlertTriangle /></span><div><p>업무 영향 높음</p><strong>{highImpactCount}</strong><small>확인 우선 자료</small></div></article>
          <article><span className="stat-icon violet"><Building2 /></span><div><p>정상 수집 출처</p><strong>{briefing.sources.length - failedCount}<em> / {briefing.sources.length}</em></strong><small>실시간 연결 상태</small></div></article>
        </section>

        <section className="briefing-strip">
          <div className="briefing-label"><Sparkles size={18} /><span>오늘 한눈에 보기</span></div>
          <p>
            {periodLabel} 확인된 교육계 자료는 <strong>{periodItems.length}건</strong>입니다. 교육부 {periodItems.filter((i) => i.source === "moe_press").length}건,
            연합뉴스 교육 {periodItems.filter((i) => i.source === "yna").length}건이 수집됐습니다.
            {failedCount ? " 일부 출처 수집 오류는 관리 화면에서 확인해 주세요." : " 현재 네 출처의 수집 연결은 모두 정상입니다."}
          </p>
          <span className="analysis-label">자동 집계 · AI 분석 아님</span>
        </section>

        <div className="content-grid">
          <section className="primary-column">
            <div className="section-heading"><div><span className="section-kicker">PRIORITY WATCH</span><h2>{periodLabel} TOP 5</h2></div><p>제도·안전·입시 등 업무 키워드 기준</p></div>
            <div className="top-list">
              {topItems.map((item, index) => (
                <article className={`top-card rank-${index + 1}`} key={item.url}>
                  <div className="rank">{String(index + 1).padStart(2, "0")}</div>
                  <div className="top-body">
                    <div className="meta-row"><span className={`source-tag ${sourceMeta[item.source].tone}`}>{sourceMeta[item.source].short}</span><span>{formatDate(item.publishedAt)}</span><span className={`impact ${impact(item)}`}>{impact(item) === "high" ? "업무 영향 높음" : impact(item) === "medium" ? "관심 필요" : "참고 동향"}</span></div>
                    <h3>{item.title}</h3>
                    {item.excerpt && <p>{item.excerpt}</p>}
                    <a href={item.url} target="_blank" rel="noreferrer">원문 보기 <ExternalLink size={14} /></a>
                  </div>
                  <button className={`star-button ${favorites.includes(item.url) ? "saved" : ""}`} onClick={() => toggleFavorite(item.url)} aria-label="즐겨찾기"><Star size={19} fill={favorites.includes(item.url) ? "currentColor" : "none"} /></button>
                </article>
              ))}
              {topItems.length === 0 && <div className="empty-state">{periodLabel} 등록된 게시물이 없습니다.</div>}
            </div>
          </section>

          <aside className="right-column" id="sources">
            <div className="section-heading compact"><div><span className="section-kicker">LIVE SOURCES</span><h2>기관별 수집 현황</h2></div></div>
            <div className="source-stack">
              {briefing.sources.map((item) => {
                const rangeCount = item.items.filter((news) => news.publishedAt >= periodStart && news.publishedAt <= briefing.date).length;
                return <article className="source-card" key={item.source}>
                  <span className={`source-dot ${sourceMeta[item.source].tone}`} />
                  <div><strong>{item.label}</strong><p>{item.status === "success" ? item.source === "yna" ? `RSS 최신 제공분 ${item.items.length}건` : `최근 한 달 ${item.items.length}건 수집` : "수집 오류"}</p></div>
                  <div className="source-count"><strong>{rangeCount}</strong><span>{periodLabel}</span></div>
                </article>;
              })}
            </div>
            <Link className="admin-link" href="/admin/collect">수집 상태 자세히 보기 <ChevronRight size={16} /></Link>
          </aside>
        </div>

        <section className="news-section" id="new">
          <div className="section-heading"><div><span className="section-kicker">LIVE FEED</span><h2>{periodLabel} 올라온 자료</h2></div><p>{filtered.length}건 표시</p></div>
          <div className="filter-bar">
            <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제목·본문 검색" /></label>
            <div className="source-filters" aria-label="출처 필터">
              <button className={source === "all" ? "selected" : ""} onClick={() => setSource("all")}>전체</button>
              {(Object.keys(sourceMeta) as Source[]).map((key) => <button className={source === key ? "selected" : ""} onClick={() => setSource(key)} key={key}>{sourceMeta[key].short}</button>)}
            </div>
          </div>
          {period !== "today" && <p className="coverage-note">연합뉴스는 공식 RSS가 현재 제공하는 최신 항목 범위 안에서만 주간·월간 자료에 포함됩니다.</p>}
          <div className="news-table">
            {filtered.map((item) => (
              <article className="news-row" key={item.url}>
                <FileText className="row-icon" size={20} />
                <div className="news-main"><div><span className={`source-tag ${sourceMeta[item.source].tone}`}>{sourceMeta[item.source].short}</span><span>{formatDate(item.publishedAt)}</span></div><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></div>
                <span className={`impact ${impact(item)}`}>{impact(item) === "high" ? "높음" : impact(item) === "medium" ? "관심" : "참고"}</span>
                <button className={`star-button ${favorites.includes(item.url) ? "saved" : ""}`} onClick={() => toggleFavorite(item.url)} aria-label="즐겨찾기"><Star size={18} fill={favorites.includes(item.url) ? "currentColor" : "none"} /></button>
                <a className="external-button" href={item.url} target="_blank" rel="noreferrer" aria-label="원문 열기"><ExternalLink size={17} /></a>
              </article>
            ))}
            {filtered.length === 0 && <div className="empty-state">조건에 맞는 {periodLabel} 자료가 없습니다.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
