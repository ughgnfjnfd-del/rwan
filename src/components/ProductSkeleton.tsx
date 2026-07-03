"use client";

import React from "react";

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm flex-shrink-0 w-[200px] xs:w-[220px] md:w-[240px] lg:w-[260px] animate-pulse">
      {/* Image area skeleton */}
      <div className="relative aspect-square overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-100 p-5">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 skeleton-shimmer" />
        {/* Fake product shape */}
        <div className="flex h-full items-center justify-center">
          <div className="w-20 h-28 rounded-2xl bg-slate-200/60" />
        </div>
        {/* Badge skeleton */}
        <div className="absolute top-2.5 right-2.5 w-14 h-5 rounded-lg bg-slate-200/60" />
        {/* Bottom badge */}
        <div className="absolute bottom-2.5 right-2.5 w-12 h-5 rounded-lg bg-slate-200/50" />
      </div>

      {/* Info area skeleton */}
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="space-y-2.5">
          {/* Category + Rating row */}
          <div className="flex items-center justify-between gap-2">
            <div className="w-14 h-4 rounded-md bg-slate-100" />
            <div className="w-10 h-4 rounded-md bg-slate-100" />
          </div>
          {/* Product name */}
          <div className="space-y-1.5">
            <div className="w-3/4 h-3 rounded bg-slate-100" />
            <div className="w-full h-4 rounded bg-slate-150" />
            <div className="w-2/3 h-4 rounded bg-slate-100" />
          </div>
          {/* Highlights */}
          <div className="flex gap-1">
            <div className="w-16 h-5 rounded-md bg-slate-50" />
            <div className="w-14 h-5 rounded-md bg-slate-50" />
          </div>
        </div>

        {/* Price + Button */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-end justify-between mb-3">
            <div className="w-20 h-5 rounded bg-slate-100" />
            <div className="w-12 h-4 rounded-md bg-slate-50" />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div className="h-8 rounded-xl bg-slate-100" />
            <div className="w-10 h-8 rounded-xl bg-slate-200/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex overflow-hidden gap-4 sm:gap-6 pb-6 px-4 -mx-4 md:px-2 md:-mx-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
