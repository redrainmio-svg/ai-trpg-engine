export function downloadSave(worldName: string, state: any) {

  const saveData = {
    worldName,
    saveTime: new Date().toISOString(),
    state
  };

  const json = JSON.stringify(saveData, null, 2);

  const blob = new Blob([json], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = `${worldName}.trpgsave.json`;

  a.click();

  URL.revokeObjectURL(url);
}

export function loadSaveFile(file: File): Promise<any> {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data);
      } catch (err) {
        reject("存檔檔案格式錯誤");
      }
    };

    reader.readAsText(file);
  });
}