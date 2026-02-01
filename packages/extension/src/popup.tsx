import "./popup/styles.css";

function IndexPopup() {
  return (
    <main className="w-[400px] min-h-[500px] bg-white">
      <header className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📰</span>
          <div>
            <h1 className="text-lg font-bold">小查馆</h1>
            <p className="text-xs opacity-80">AI 多语种事实核查</p>
          </div>
        </div>
      </header>
      <div className="p-4">
        <p>扩展已加载成功！</p>
      </div>
    </main>
  );
}

export default IndexPopup;
