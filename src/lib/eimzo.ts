const EIMZO_URL = "wss://127.0.0.1:64443/service/cryptapi";

let ws: WebSocket | null = null;
let pendingResolve: ((value: any) => void) | null = null;
let pendingReject: ((reason?: any) => void) | null = null;

function disconnect() {
  if (ws) {
    ws.onopen = null;
    ws.onclose = null;
    ws.onerror = null;
    ws.onmessage = null;
    ws.close();
    ws = null;
  }
  pendingResolve = null;
  pendingReject = null;
}

function connect(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }

    try {
      ws = new WebSocket(EIMZO_URL);
    } catch {
      reject(new Error("E-IMZO dasturiga ulanib bo'lmadi"));
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error("E-IMZO dasturiga ulanish vaqti tugadi"));
      ws?.close();
    }, 5000);

    ws.onopen = () => {
      clearTimeout(timeout);
      resolve();
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("E-IMZO dasturiga ulanib bo'lmadi. Dastur ishga tushirilganligini tekshiring."));
    };

    ws.onclose = () => {
      ws = null;
      if (pendingReject) {
        pendingReject(new Error("E-IMZO bilan aloqa uzildi"));
        pendingResolve = null;
        pendingReject = null;
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        if (pendingReject) {
          pendingReject(new Error("E-IMZO dan noto'g'ri javob"));
          pendingResolve = null;
          pendingReject = null;
        }
        return;
      }

      if (pendingResolve) {
        const res = pendingResolve;
        const rej = pendingReject;
        pendingResolve = null;
        pendingReject = null;
        disconnect();

        if (data.success === false || data.error) {
          rej?.(data.reason || data.error || "E-IMZO xatolik");
        } else {
          res(data);
        }
      }
    };
  });
}

async function callFunction(plugin: string, name: string, args?: string[]): Promise<any> {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    await connect();
  }

  return new Promise((resolve, reject) => {
    if (pendingResolve) {
      reject(new Error("Oldingi so'rov hali tugamagan"));
      return;
    }

    pendingResolve = resolve;
    pendingReject = reject;

    const message: any = { plugin, name };
    if (args && args.length > 0) {
      message.arguments = args;
    }

    ws!.send(JSON.stringify(message));
  });
}

export async function listAllCertificates(): Promise<any[]> {
  const data = await callFunction("pfx", "list_all_certificates");
  return data.certificates || [];
}

export async function loadKey(disk: string, path: string, name: string, alias: string): Promise<string> {
  const data = await callFunction("pfx", "load_key", [disk, path, name, alias]);
  return data.keyId;
}

export async function createPkcs7(data64: string, keyId: string, detached?: string): Promise<string> {
  const data = await callFunction("pkcs7", "create_pkcs7", [data64, keyId, detached || ""]);
  return data.pkcs7_64;
}

export const EImzo = {
  connect,
  disconnect,
  listAllCertificates,
  loadKey,
  createPkcs7,
};
