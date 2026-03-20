import{j as e}from"./motion-Dj98oFl_.js";import{a as c,af as g}from"./ui-WZIdjdpa.js";const x=c.forwardRef(({children:s,variant:r="primary",size:a="md",isLoading:t=!1,disabled:i,className:l="",...o},n)=>{const b=`
      inline-flex items-center justify-center gap-2 font-medium rounded-xl
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `,d={primary:`
        bg-blue-600 text-white
        hover:bg-blue-700 hover:-translate-y-0.5 active:bg-blue-800
        shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30
        focus-visible:ring-blue-500
      `,secondary:`
        bg-white text-slate-700
        border border-slate-200
        hover:bg-slate-50
        active:bg-slate-100
        focus-visible:ring-slate-400
      `,ghost:`
        bg-transparent text-slate-600
        hover:bg-slate-100
        active:bg-slate-200
        focus-visible:ring-slate-400
      `,danger:`
        bg-red-600 text-white
        hover:bg-red-700 active:bg-red-800
        focus-visible:ring-red-500
      `,outline:`
        bg-transparent text-blue-600
        border-2 border-blue-600
        hover:bg-blue-50
        active:bg-blue-100
        focus-visible:ring-blue-500
      `},u={sm:"px-3 py-1.5 text-sm",md:"px-4 py-2.5 text-sm",lg:"px-6 py-3 text-base"};return e.jsx("button",{ref:n,className:`${b} ${d[r]} ${u[a]} ${l}`,disabled:i||t,...o,children:t?e.jsxs(e.Fragment,{children:[e.jsx(g,{className:"w-4 h-4 animate-spin"}),e.jsx("span",{children:"Загрузка..."})]}):s})});x.displayName="Button";export{x as B};
