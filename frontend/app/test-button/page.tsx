'use client';

import React from 'react';

export default function TestButtonPage() {
  const [clicked, setClicked] = React.useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">ボタンテスト</h1>
      
      <button
        onClick={() => setClicked(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        type="button"
      >
        クリックしてください
      </button>

      {clicked && (
        <div className="mt-4 text-green-600">
          ✅ ボタンがクリックされました！
        </div>
      )}
    </div>
  );
}

