/* eslint-disable */
// @ts-nocheck
// routeTree.gen.ts — manually maintained
// Covers all 34 routes in سكينة v3

import { Route as rootRouteImport }             from './routes/__root'
import { Route as IndexRouteImport }             from './routes/index'
import { Route as AdhkarRouteImport }            from './routes/adhkar'
import { Route as AiChatRouteImport }            from './routes/ai-chat'
import { Route as BookmarksRouteImport }         from './routes/bookmarks'
import { Route as CalendarRouteImport }          from './routes/calendar'
import { Route as DuaRouteImport }               from './routes/dua'
import { Route as FastingRouteImport }           from './routes/fasting'
import { Route as HadithRouteImport }            from './routes/hadith'
import { Route as KhatmahRouteImport }           from './routes/khatmah'
import { Route as MushafPageRouteImport }        from './routes/mushaf.$page'
import { Route as NamesRouteImport }             from './routes/names'
import { Route as PrayerRouteImport }            from './routes/prayer'
import { Route as QiblaRouteImport }             from './routes/qibla'
import { Route as QuranRouteImport }             from './routes/quran'
import { Route as RadioRouteImport }             from './routes/radio'
import { Route as RakaatRouteImport }            from './routes/rakaat'
import { Route as RecitersRouteImport }          from './routes/reciters'
import { Route as SearchRouteImport }            from './routes/search'
import { Route as SettingsRouteImport }          from './routes/settings'
import { Route as SitemapDotxmlRouteImport }     from './routes/sitemap[.]xml'
import { Route as TasbeehRouteImport }           from './routes/tasbeeh'
import { Route as ToolsRouteImport }             from './routes/tools'
import { Route as WirdRouteImport }              from './routes/wird'
// Children
import { Route as AdhkarCategoryRouteImport }   from './routes/adhkar.$category'
import { Route as HadithIndexRouteImport }       from './routes/hadith.index'
import { Route as QuranIdRouteImport }           from './routes/quran.$id'
import { Route as QuranIdTafsirRouteImport }     from './routes/quran.$id.tafsir'
import { Route as QuranIndexRouteImport }        from './routes/quran.index'
import { Route as QuranSearchRouteImport }       from './routes/quran.search'
import { Route as RecitersIdRouteImport }        from './routes/reciters.$id'
import { Route as RecitersIndexRouteImport }     from './routes/reciters.index'

// ── Route instances ──────────────────────────────────────
const r = (imp: any, id: string, path: string, parent: any) =>
  imp.update({ id, path, getParentRoute: () => parent } as any)

const IndexRoute          = r(IndexRouteImport,          '/',               '/',               rootRouteImport)
const AdhkarRoute         = r(AdhkarRouteImport,         '/adhkar',         '/adhkar',         rootRouteImport)
const AiChatRoute         = r(AiChatRouteImport,         '/ai-chat',        '/ai-chat',        rootRouteImport)
const BookmarksRoute      = r(BookmarksRouteImport,      '/bookmarks',      '/bookmarks',      rootRouteImport)
const CalendarRoute       = r(CalendarRouteImport,       '/calendar',       '/calendar',       rootRouteImport)
const DuaRoute            = r(DuaRouteImport,            '/dua',            '/dua',            rootRouteImport)
const FastingRoute        = r(FastingRouteImport,        '/fasting',        '/fasting',        rootRouteImport)
const HadithRoute         = r(HadithRouteImport,         '/hadith',         '/hadith',         rootRouteImport)
const KhatmahRoute        = r(KhatmahRouteImport,        '/khatmah',        '/khatmah',        rootRouteImport)
const MushafPageRoute     = r(MushafPageRouteImport,     '/mushaf/$page',   '/mushaf/$page',   rootRouteImport)
const NamesRoute          = r(NamesRouteImport,          '/names',          '/names',          rootRouteImport)
const PrayerRoute         = r(PrayerRouteImport,         '/prayer',         '/prayer',         rootRouteImport)
const QiblaRoute          = r(QiblaRouteImport,          '/qibla',          '/qibla',          rootRouteImport)
const QuranRoute          = r(QuranRouteImport,          '/quran',          '/quran',          rootRouteImport)
const RadioRoute          = r(RadioRouteImport,          '/radio',          '/radio',          rootRouteImport)
const RakaatRoute         = r(RakaatRouteImport,         '/rakaat',         '/rakaat',         rootRouteImport)
const RecitersRoute       = r(RecitersRouteImport,       '/reciters',       '/reciters',       rootRouteImport)
const SearchRoute         = r(SearchRouteImport,         '/search',         '/search',         rootRouteImport)
const SettingsRoute       = r(SettingsRouteImport,       '/settings',       '/settings',       rootRouteImport)
const SitemapDotxmlRoute  = r(SitemapDotxmlRouteImport,  '/sitemap.xml',    '/sitemap.xml',    rootRouteImport)
const TasbeehRoute        = r(TasbeehRouteImport,        '/tasbeeh',        '/tasbeeh',        rootRouteImport)
const ToolsRoute          = r(ToolsRouteImport,          '/tools',          '/tools',          rootRouteImport)
const WirdRoute           = r(WirdRouteImport,           '/wird',           '/wird',           rootRouteImport)
// Children
const AdhkarCategoryRoute = r(AdhkarCategoryRouteImport, '/adhkar/$category', '/$category', AdhkarRoute)
const HadithIndexRoute    = r(HadithIndexRouteImport,    '/hadith/',        '/',               HadithRoute)
const QuranIdRoute        = r(QuranIdRouteImport,        '/quran/$id',      '/$id',            QuranRoute)
const QuranIdTafsirRoute  = r(QuranIdTafsirRouteImport,  '/quran/$id/tafsir', '/tafsir',       QuranIdRoute)
const QuranIndexRoute     = r(QuranIndexRouteImport,     '/quran/',         '/',               QuranRoute)
const QuranSearchRoute    = r(QuranSearchRouteImport,    '/quran/search',   '/search',         QuranRoute)
const RecitersIdRoute     = r(RecitersIdRouteImport,     '/reciters/$id',   '/$id',            RecitersRoute)
const RecitersIndexRoute  = r(RecitersIndexRouteImport,  '/reciters/',      '/',               RecitersRoute)

// ── Children maps ─────────────────────────────────────────
const AdhkarRouteWithChildren   = AdhkarRoute._addFileChildren({ AdhkarCategoryRoute })
const HadithRouteWithChildren   = HadithRoute._addFileChildren({ HadithIndexRoute })
const QuranIdRouteWithChildren  = QuranIdRoute._addFileChildren({ QuranIdTafsirRoute })
const QuranRouteWithChildren    = QuranRoute._addFileChildren({ QuranIndexRoute, QuranIdRoute: QuranIdRouteWithChildren, QuranSearchRoute })
const RecitersRouteWithChildren = RecitersRoute._addFileChildren({ RecitersIndexRoute, RecitersIdRoute })

// ── Root ──────────────────────────────────────────────────
export const routeTree = rootRouteImport._addFileChildren({
  IndexRoute,
  AdhkarRoute:    AdhkarRouteWithChildren,
  AiChatRoute,
  BookmarksRoute,
  CalendarRoute,
  DuaRoute,
  FastingRoute,
  HadithRoute:    HadithRouteWithChildren,
  KhatmahRoute,
  MushafPageRoute,
  NamesRoute,
  PrayerRoute,
  QiblaRoute,
  QuranRoute:     QuranRouteWithChildren,
  RadioRoute,
  RakaatRoute,
  RecitersRoute:  RecitersRouteWithChildren,
  SearchRoute,
  SettingsRoute,
  SitemapDotxmlRoute,
  TasbeehRoute,
  ToolsRoute,
  WirdRoute,
})

export interface FileRouteTypes {
  fileRoutesByFullPath: any
  fullPaths: '/' | '/adhkar' | '/ai-chat' | '/bookmarks' | '/calendar' | '/dua' | '/fasting' |
    '/hadith' | '/hadith/' | '/khatmah' | '/mushaf/$page' | '/names' | '/prayer' | '/qibla' |
    '/quran' | '/quran/' | '/quran/$id' | '/quran/$id/tafsir' | '/quran/search' | '/radio' |
    '/rakaat' | '/reciters' | '/reciters/' | '/reciters/$id' | '/search' | '/settings' |
    '/sitemap.xml' | '/tasbeeh' | '/tools' | '/wird' | '/adhkar/$category'
  fileRoutesByTo: any
  to: '/' | '/adhkar' | '/ai-chat' | '/bookmarks' | '/calendar' | '/dua' | '/fasting' |
    '/hadith' | '/khatmah' | '/mushaf/$page' | '/names' | '/prayer' | '/qibla' |
    '/quran' | '/quran/$id' | '/quran/$id/tafsir' | '/quran/search' | '/radio' |
    '/rakaat' | '/reciters' | '/reciters/$id' | '/search' | '/settings' |
    '/sitemap.xml' | '/tasbeeh' | '/tools' | '/wird' | '/adhkar/$category'
  id: '__root__' | '/' | '/adhkar' | '/ai-chat' | '/bookmarks' | '/calendar' | '/dua' | '/fasting' |
    '/hadith' | '/hadith/' | '/khatmah' | '/mushaf/$page' | '/names' | '/prayer' | '/qibla' |
    '/quran' | '/quran/' | '/quran/$id' | '/quran/$id/tafsir' | '/quran/search' | '/radio' |
    '/rakaat' | '/reciters' | '/reciters/' | '/reciters/$id' | '/search' | '/settings' |
    '/sitemap.xml' | '/tasbeeh' | '/tools' | '/wird' | '/adhkar/$category'
  fileRoutesById: any
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/adhkar': { id: '/adhkar'; path: '/adhkar'; fullPath: '/adhkar'; preLoaderRoute: typeof AdhkarRouteImport; parentRoute: typeof rootRouteImport }
    '/ai-chat': { id: '/ai-chat'; path: '/ai-chat'; fullPath: '/ai-chat'; preLoaderRoute: typeof AiChatRouteImport; parentRoute: typeof rootRouteImport }
    '/bookmarks': { id: '/bookmarks'; path: '/bookmarks'; fullPath: '/bookmarks'; preLoaderRoute: typeof BookmarksRouteImport; parentRoute: typeof rootRouteImport }
    '/calendar': { id: '/calendar'; path: '/calendar'; fullPath: '/calendar'; preLoaderRoute: typeof CalendarRouteImport; parentRoute: typeof rootRouteImport }
    '/dua': { id: '/dua'; path: '/dua'; fullPath: '/dua'; preLoaderRoute: typeof DuaRouteImport; parentRoute: typeof rootRouteImport }
    '/fasting': { id: '/fasting'; path: '/fasting'; fullPath: '/fasting'; preLoaderRoute: typeof FastingRouteImport; parentRoute: typeof rootRouteImport }
    '/hadith': { id: '/hadith'; path: '/hadith'; fullPath: '/hadith'; preLoaderRoute: typeof HadithRouteImport; parentRoute: typeof rootRouteImport }
    '/hadith/': { id: '/hadith/'; path: '/'; fullPath: '/hadith/'; preLoaderRoute: typeof HadithIndexRouteImport; parentRoute: typeof HadithRoute }
    '/khatmah': { id: '/khatmah'; path: '/khatmah'; fullPath: '/khatmah'; preLoaderRoute: typeof KhatmahRouteImport; parentRoute: typeof rootRouteImport }
    '/mushaf/$page': { id: '/mushaf/$page'; path: '/mushaf/$page'; fullPath: '/mushaf/$page'; preLoaderRoute: typeof MushafPageRouteImport; parentRoute: typeof rootRouteImport }
    '/names': { id: '/names'; path: '/names'; fullPath: '/names'; preLoaderRoute: typeof NamesRouteImport; parentRoute: typeof rootRouteImport }
    '/prayer': { id: '/prayer'; path: '/prayer'; fullPath: '/prayer'; preLoaderRoute: typeof PrayerRouteImport; parentRoute: typeof rootRouteImport }
    '/qibla': { id: '/qibla'; path: '/qibla'; fullPath: '/qibla'; preLoaderRoute: typeof QiblaRouteImport; parentRoute: typeof rootRouteImport }
    '/quran': { id: '/quran'; path: '/quran'; fullPath: '/quran'; preLoaderRoute: typeof QuranRouteImport; parentRoute: typeof rootRouteImport }
    '/quran/': { id: '/quran/'; path: '/'; fullPath: '/quran/'; preLoaderRoute: typeof QuranIndexRouteImport; parentRoute: typeof QuranRoute }
    '/quran/$id': { id: '/quran/$id'; path: '/$id'; fullPath: '/quran/$id'; preLoaderRoute: typeof QuranIdRouteImport; parentRoute: typeof QuranRoute }
    '/quran/$id/tafsir': { id: '/quran/$id/tafsir'; path: '/tafsir'; fullPath: '/quran/$id/tafsir'; preLoaderRoute: typeof QuranIdTafsirRouteImport; parentRoute: typeof QuranIdRoute }
    '/quran/search': { id: '/quran/search'; path: '/search'; fullPath: '/quran/search'; preLoaderRoute: typeof QuranSearchRouteImport; parentRoute: typeof QuranRoute }
    '/radio': { id: '/radio'; path: '/radio'; fullPath: '/radio'; preLoaderRoute: typeof RadioRouteImport; parentRoute: typeof rootRouteImport }
    '/rakaat': { id: '/rakaat'; path: '/rakaat'; fullPath: '/rakaat'; preLoaderRoute: typeof RakaatRouteImport; parentRoute: typeof rootRouteImport }
    '/reciters': { id: '/reciters'; path: '/reciters'; fullPath: '/reciters'; preLoaderRoute: typeof RecitersRouteImport; parentRoute: typeof rootRouteImport }
    '/reciters/': { id: '/reciters/'; path: '/'; fullPath: '/reciters/'; preLoaderRoute: typeof RecitersIndexRouteImport; parentRoute: typeof RecitersRoute }
    '/reciters/$id': { id: '/reciters/$id'; path: '/$id'; fullPath: '/reciters/$id'; preLoaderRoute: typeof RecitersIdRouteImport; parentRoute: typeof RecitersRoute }
    '/search': { id: '/search'; path: '/search'; fullPath: '/search'; preLoaderRoute: typeof SearchRouteImport; parentRoute: typeof rootRouteImport }
    '/settings': { id: '/settings'; path: '/settings'; fullPath: '/settings'; preLoaderRoute: typeof SettingsRouteImport; parentRoute: typeof rootRouteImport }
    '/sitemap.xml': { id: '/sitemap.xml'; path: '/sitemap.xml'; fullPath: '/sitemap.xml'; preLoaderRoute: typeof SitemapDotxmlRouteImport; parentRoute: typeof rootRouteImport }
    '/tasbeeh': { id: '/tasbeeh'; path: '/tasbeeh'; fullPath: '/tasbeeh'; preLoaderRoute: typeof TasbeehRouteImport; parentRoute: typeof rootRouteImport }
    '/tools': { id: '/tools'; path: '/tools'; fullPath: '/tools'; preLoaderRoute: typeof ToolsRouteImport; parentRoute: typeof rootRouteImport }
    '/wird': { id: '/wird'; path: '/wird'; fullPath: '/wird'; preLoaderRoute: typeof WirdRouteImport; parentRoute: typeof rootRouteImport }
    '/adhkar/$category': { id: '/adhkar/$category'; path: '/$category'; fullPath: '/adhkar/$category'; preLoaderRoute: typeof AdhkarCategoryRouteImport; parentRoute: typeof AdhkarRoute }
  }
}
