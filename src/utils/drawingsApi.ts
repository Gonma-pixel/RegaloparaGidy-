import { idbGet, idbSet } from './storage';

export interface SavedDrawingRecord {
  id: string;
  title: string;
  dataUrl: string;
  createdAt: string;
}

const LOCAL_GALLERY_KEY = 'dedication_drawings_gallery_v1';

export function buildDashboardUrl(drawingId?: string): string {
  if (typeof window === 'undefined') return '?dashboard=dibujos';
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams();
  params.set('dashboard', 'dibujos');
  if (drawingId) {
    params.set('id', drawingId);
  }
  return `${baseUrl}?${params.toString()}`;
}

function isJsonResponse(response: Response): boolean {
  const ct = response.headers.get('content-type') || '';
  return ct.includes('application/json');
}

export async function saveDrawingToDashboard(
  dataUrl: string,
  title = 'Dibujo de nuestro lienzo mágico'
): Promise<{ record: SavedDrawingRecord; dashboardUrl: string }> {
  const localRecord: SavedDrawingRecord = {
    id: `dibujo-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`,
    title,
    dataUrl,
    createdAt: new Date().toISOString(),
  };

  let finalRecord = localRecord;

  try {
    const response = await fetch('./api/drawings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, title }),
    });
    if (response.ok && isJsonResponse(response)) {
      const json = (await response.json()) as { drawing?: SavedDrawingRecord };
      if (json.drawing?.id) {
        finalRecord = json.drawing;
      }
    }
  } catch {
    // Fallback gracefully to IndexedDB on static hosts (e.g. GitHub Pages)
  }

  const existingLocal =
    (await idbGet<SavedDrawingRecord[]>(LOCAL_GALLERY_KEY)) ?? [];
  const deduped = [
    finalRecord,
    ...existingLocal.filter((item) => item.id !== finalRecord.id),
  ].slice(0, 60);
  await idbSet(LOCAL_GALLERY_KEY, deduped);

  return {
    record: finalRecord,
    dashboardUrl: buildDashboardUrl(finalRecord.id),
  };
}

export async function fetchDashboardDrawings(): Promise<SavedDrawingRecord[]> {
  const localItems =
    (await idbGet<SavedDrawingRecord[]>(LOCAL_GALLERY_KEY)) ?? [];

  try {
    const response = await fetch('./api/drawings');
    if (response.ok && isJsonResponse(response)) {
      const json = (await response.json()) as {
        drawings?: SavedDrawingRecord[];
      };
      const serverItems = Array.isArray(json.drawings) ? json.drawings : [];
      const seen = new Set(serverItems.map((item) => item.id));
      return [
        ...serverItems,
        ...localItems.filter((item) => !seen.has(item.id)),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch {
    // Fall back to local IndexedDB cache
  }

  return localItems;
}

export async function fetchDashboardDrawingById(
  id: string
): Promise<SavedDrawingRecord | null> {
  try {
    const response = await fetch(`./api/drawings/${encodeURIComponent(id)}`);
    if (response.ok && isJsonResponse(response)) {
      const json = (await response.json()) as {
        drawing?: SavedDrawingRecord;
      };
      if (json.drawing) return json.drawing;
    }
  } catch {
    // Fall back to IndexedDB
  }

  const localItems =
    (await idbGet<SavedDrawingRecord[]>(LOCAL_GALLERY_KEY)) ?? [];
  return localItems.find((item) => item.id === id) ?? null;
}

export async function deleteDashboardDrawing(id: string): Promise<void> {
  try {
    await fetch(`./api/drawings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch {
    // ignore network failure
  }

  const localItems =
    (await idbGet<SavedDrawingRecord[]>(LOCAL_GALLERY_KEY)) ?? [];
  await idbSet(
    LOCAL_GALLERY_KEY,
    localItems.filter((item) => item.id !== id)
  );
}
