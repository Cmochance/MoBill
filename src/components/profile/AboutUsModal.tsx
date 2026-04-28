"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CardFrame } from "../CardFrame";
import {
  APP_NAME,
  APP_VERSION,
  GITHUB_URL,
  checkForAppUpdate,
  type VersionCheckResult,
} from "@/lib/app-info";

interface AboutUsModalProps {
  onClose: () => void;
}

type VersionCheckState =
  | VersionCheckResult
  | {
      status: "checking";
      message: string;
    };

export function AboutUsModal({ onClose }: AboutUsModalProps) {
  const [versionCheck, setVersionCheck] = useState<VersionCheckState>({
    status: "checking",
    message: "正在检测版本更新...",
  });

  useEffect(() => {
    let cancelled = false;

    checkForAppUpdate().then((result) => {
      if (!cancelled) {
        setVersionCheck(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const versionStatusColor =
    versionCheck.status === "available"
      ? "#C45C4A"
      : versionCheck.status === "current"
        ? "#5A8F7B"
        : "#8C8678";
  const directDownloadUrl =
    "downloadUrl" in versionCheck ? versionCheck.downloadUrl : undefined;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(45, 39, 31, 0.42)" }}
      role="presentation"
      onClick={onClose}
    >
      <CardFrame
        className="max-h-[86vh] w-full max-w-sm rounded-2xl shadow-xl"
        contentClassName="max-h-[86vh] overflow-y-auto p-5 no-scrollbar"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-us-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full">
                <img
                  src="/record.png"
                  alt={APP_NAME}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2
                  id="about-us-title"
                  className="brand-title text-xl font-bold leading-none text-[#3D3D3D]"
                >
                  {APP_NAME}
                </h2>
                <div className="mt-1 text-xs text-[#8C8678]">
                  当前版本 v{APP_VERSION}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-[#8C8678] transition-colors active:bg-[#F5F0E8]"
              aria-label="关闭关于我们"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 text-sm leading-6 text-[#6B6658]">
            <section>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-[#5A8F7B]" />
                <h3 className="font-semibold text-[#3D3D3D]">关于应用</h3>
              </div>
              <p>
                墨风记账是一款面向个人日常收支的轻量账本。它把记账、预算、分类和本机备份放在同一个安静的界面里，让每一笔开销都能被清楚记录，也让每个月的收入、支出和结余有迹可循。
              </p>
            </section>

            <section>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-[#C4954A]" />
                <h3 className="font-semibold text-[#3D3D3D]">设计理念</h3>
              </div>
              <p>
                界面以宣纸底色、松烟墨绿和朱砂点色为基础，弱化复杂装饰，保留账本、印章与手作纸张的气息。设计目标不是制造负担，而是让频繁记账这件事保持清爽、稳定和有一点东方书写感。
              </p>
            </section>

            <section>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-[#C45C4A]" />
                <h3 className="font-semibold text-[#3D3D3D]">联系我们</h3>
              </div>
              <div className="space-y-1">
                <div>
                  GitHub 地址：
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#5A8F7B] underline-offset-2 active:underline"
                  >
                    {GITHUB_URL}
                  </a>
                </div>
                <div>QQ：3216202644</div>
              </div>
            </section>

            <section>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-[#7A9AA8]" />
                <h3 className="font-semibold text-[#3D3D3D]">版本更新</h3>
              </div>
              <div
                className="rounded-xl px-3 py-2 text-xs leading-5"
                style={{
                  backgroundColor: "rgba(var(--primary-rgb), 0.08)",
                  color: versionStatusColor,
                }}
              >
                <div>{versionCheck.message}</div>
                {versionCheck.status === "available" && (
                  <div className="mt-3 space-y-3">
                    {versionCheck.updates.map((update) => (
                      <div
                        key={update.version}
                        className="rounded-lg px-3 py-2"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.42)" }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#3D3D3D]">
                            v{update.version}
                          </span>
                          {update.publishedAt && (
                            <span className="shrink-0 text-[10px] text-[#8C8678]">
                              {update.publishedAt.slice(0, 10)}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[11px] font-medium text-[#6B6658]">
                          {update.title}
                        </div>
                        <div className="mt-2 whitespace-pre-line break-words text-[11px] leading-5 text-[#6B6658]">
                          {update.body}
                        </div>
                      </div>
                    ))}

                    {directDownloadUrl ? (
                      <a
                        href={directDownloadUrl}
                        download
                        className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-center text-sm font-semibold leading-5 text-white active:scale-[0.98]"
                        style={{ backgroundColor: "var(--primary)" }}
                      >
                        下载更新
                      </a>
                    ) : (
                      <div className="rounded-lg px-3 py-2 text-[11px] text-[#8C8678]">
                        该版本暂未提供可直接下载的安装包。
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </CardFrame>
    </div>
  );
}
