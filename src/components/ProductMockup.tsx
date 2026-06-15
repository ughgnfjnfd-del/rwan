"use client";

import React from "react";


export interface ProductMockupProps {
  image: string;
  name: string;
  sizeClass?: string;
}

export default function ProductMockup({ image, name, sizeClass = "w-24 aspect-[9/18]" }: ProductMockupProps) {
  if (image === "iphone") {
    return (
      <div className={`${sizeClass} bg-slate-800 rounded-3xl p-1 shadow-lg border-2 border-slate-600 flex flex-col relative group-hover:scale-105 transition-transform duration-300`}>
        <div className="absolute top-2 right-2 w-7 h-7 bg-slate-700/80 rounded-lg p-0.5 grid grid-cols-2 gap-0.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-500"></div>
          <div className="col-span-2 mx-auto w-2 h-2 rounded-full bg-slate-950 border border-slate-500"></div>
        </div>
        <div className="flex-1 bg-slate-900 rounded-[22px] flex items-center justify-center relative overflow-hidden border border-slate-950/20">
          <div className="absolute top-1 w-6 h-1.5 bg-black rounded-full"></div>
          <span className="text-[7px] text-[#38BDF8] font-bold">15 Pro</span>
        </div>
      </div>
    );
  }
  if (image === "samsung") {
    return (
      <div className={`${sizeClass} bg-slate-900 rounded-xl p-1 shadow-lg border-2 border-slate-700 flex flex-col relative group-hover:scale-105 transition-transform duration-300`}>
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-500"></div>
          <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-500"></div>
          <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-500"></div>
        </div>
        <div className="flex-1 bg-slate-950 rounded-lg flex items-center justify-center relative overflow-hidden border border-slate-900">
          <div className="absolute top-0.5 w-1 h-1 rounded-full bg-black"></div>
          <span className="text-[7px] text-amber-500 font-bold">Galaxy S24</span>
        </div>
      </div>
    );
  }
  if (image === "cases") {
    return (
      <div className="flex gap-2 group-hover:scale-105 transition-transform duration-300">
        <div className="w-14 aspect-[9/17] bg-[#38BDF8]/90 rounded-xl border border-sky-300 shadow-md p-1 relative">
          <div className="w-4 h-4 bg-sky-900/40 rounded absolute top-2 right-2"></div>
        </div>
        <div className="w-14 aspect-[9/17] bg-amber-700/80 rounded-xl border border-amber-600 shadow-md p-1 relative -mt-2">
          <div className="w-4 h-4 bg-amber-950/40 rounded absolute top-2 right-2"></div>
        </div>
      </div>
    );
  }
  if (image && image.startsWith("charger-")) {
    const watt = image.split("-")[1] || "20w";
    let color = "bg-white text-slate-800 border-slate-200";
    let size = "w-14 h-14";
    let detail = "";
    if (watt === "10w") {
      size = "w-11 h-11";
      color = "bg-slate-100 text-slate-600 border-slate-250";
    } else if (watt === "15w") {
      size = "w-12 h-12";
      color = "bg-white text-slate-700 border-slate-200";
    } else if (watt === "20w") {
      size = "w-14 h-14";
      color = "bg-white text-slate-800 border-slate-200";
      detail = "PD CHARGE";
    } else if (watt === "45w") {
      size = "w-15 h-15";
      color = "bg-slate-800 text-slate-100 border-slate-700";
      detail = "SUPER FAST";
    } else if (watt === "65w") {
      size = "w-16 h-16";
      color = "bg-slate-900 text-emerald-400 border-slate-800";
      detail = "GaN FAST";
    } else if (watt === "120w") {
      size = "w-18 h-18";
      color = "bg-black text-orange-500 border-orange-900/40";
      detail = "ULTRA CHARGE";
    }
    return (
      <div className={`${size} ${color} border rounded-2xl shadow-md flex flex-col items-center justify-center p-2 relative group-hover:scale-105 transition-transform duration-300`}>
        <div className="flex gap-2.5 -mt-3.5 mb-1.5">
          <div className="w-1.5 h-3 bg-slate-300 rounded-t"></div>
          <div className="w-1.5 h-3 bg-slate-300 rounded-t"></div>
        </div>
        <span className="text-[10px] font-extrabold tracking-tight">{watt.toUpperCase()}</span>
        {detail && <span className="text-[6px] font-bold text-slate-400 mt-0.5">{detail}</span>}
        <div className={`w-2.5 h-1 rounded-full mt-1 ${watt === '120w' ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
      </div>
    );
  }
  if (image === "headphones") {
    return (
      <div className="w-20 h-20 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <div className="absolute top-2 w-16 h-12 border-t-4 border-l-4 border-r-4 border-slate-500 rounded-t-full"></div>
        <div className="absolute left-1 bottom-4 w-5 h-8 bg-slate-700 rounded-full border border-slate-600 shadow"></div>
        <div className="absolute right-1 bottom-4 w-5 h-8 bg-slate-700 rounded-full border border-slate-600 shadow"></div>
        <div className="absolute top-1.5 w-10 h-2 bg-slate-600 rounded-full"></div>
      </div>
    );
  }
  if (image === "earbuds") {
    return (
      <div className="w-20 h-16 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-md relative flex flex-col justify-between items-center group-hover:scale-105 transition-transform duration-300">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <div className="flex gap-3 mt-1">
          <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
          </div>
          <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
          </div>
        </div>
        <span className="text-[6px] text-slate-400 font-bold uppercase tracking-wider">Wireless</span>
      </div>
    );
  }
  if (image === "cable") {
    return (
      <div className="w-20 h-20 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <div className="w-14 h-14 border-4 border-dashed border-slate-400 rounded-full rotate-45 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-300 rounded-full"></div>
        </div>
        <div className="absolute bottom-2 left-1.5 w-3 h-6 bg-slate-800 rounded border border-slate-600 flex flex-col items-center">
          <div className="w-1.5 h-2 bg-slate-300 rounded-t"></div>
        </div>
        <div className="absolute top-2 right-1.5 w-6 h-3 bg-slate-800 rounded border border-slate-600 flex items-center justify-end">
          <div className="w-2 h-1.5 bg-slate-300 rounded-r"></div>
        </div>
      </div>
    );
  }
  if (image === "smartwatch") {
    return (
      <div className="w-18 h-18 relative flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <div className="absolute top-0 w-8 h-4 bg-slate-800 rounded-t-lg"></div>
        <div className="absolute bottom-0 w-8 h-4 bg-slate-800 rounded-b-lg"></div>
        <div className="w-12 h-13 bg-slate-900 border-2 border-slate-700 rounded-xl shadow-lg relative z-10 p-1.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[5px] text-slate-400 font-bold font-mono">
            <span>9:41</span>
            <span className="text-emerald-500">75%</span>
          </div>
          <div className="w-full flex justify-center items-center py-1">
            <div className="w-4 h-4 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 font-bold text-[7px] animate-pulse">♥</div>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }
  if (image === "powerbank") {
    return (
      <div className="w-16 h-20 bg-slate-800 border border-slate-700 rounded-2xl p-2 shadow-lg flex flex-col justify-between group-hover:scale-105 transition-transform duration-300">
        <div className="flex justify-around items-center bg-slate-950/40 rounded-lg p-0.5">
          <div className="w-2 h-1 bg-amber-500 rounded-full"></div>
          <div className="w-3.5 h-1 bg-slate-600 rounded-full"></div>
          <div className="w-3.5 h-1 bg-slate-600 rounded-full"></div>
        </div>
        <div className="my-auto bg-slate-950 p-1.5 rounded-lg border border-slate-700 flex flex-col items-center">
          <span className="text-[9px] text-[#38BDF8] font-mono font-bold">99%</span>
          <span className="text-[5px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">PD 3.0</span>
        </div>
        <div className="text-[6px] text-center text-slate-400 font-bold font-mono">20,000 mAh</div>
      </div>
    );
  }
  if (image === "screen-protector") {
    return (
      <div className="w-20 h-22 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
        <div className="absolute w-16 h-20 border-2 border-dashed border-emerald-400/70 rounded-2xl bg-emerald-500/5"></div>
        <div className="w-12 h-18 bg-white/20 border-2 border-white/60 rounded-xl shadow-lg relative z-10 flex flex-col justify-between p-1 backdrop-blur-xs">
          <div className="w-5 h-1 bg-white/50 mx-auto rounded-full"></div>
          <span className="text-[6px] text-center text-white font-bold select-none">GLASS 9H</span>
          <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-white/50 self-end mr-0.5 mb-0.5"></div>
        </div>
      </div>
    );
  }

  // Fallback for custom image url
  return (
    <img 
      src={image} 
      alt={name} 
      className="max-w-full max-h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
    />
  );
}
