"use client";
import { useState, useTransition } from "react";

export default function SearchBox({ search: initialSearch }) {
  const [isPending, startTransition] = useTransition();

  function onChange(e) {
    startTransition(() => {
      window.router.navigate(`?search=${e.target.value}`);
    })
  }
  return (
    <>
        <input className="border-2 border-slate-500" type="text" defaultValue={initialSearch} onChange={onChange} />
        {isPending &&
          <span className="ml-2"><i>Loading...</i></span>
        }
    </>
  )
}