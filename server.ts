import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// Built-in offline Han-Viet dictionary database (24 rich entries)
const OFFLINE_DICTIONARY = [
  {
    character: "詩",
    sinoVietnamese: "Thi",
    pinyin: "shī",
    strokes: "13 nét",
    radical: "言 (ngôn)",
    definition: "Thơ ca; sự sáng tác thơ văn. Một trong Lục nghệ của Nho học.",
    examples: [
      { word: "詩歌", transcription: "Thi ca", translation: "thơ và nhạc" },
      { word: "詩人", transcription: "Thi nhân", translation: "nhà thơ" },
      { word: "作詩", transcription: "Tác thi", translation: "làm thơ" }
    ],
    analyticalNotes: "Chữ thuộc bộ Ngôn 言 (nói năng) kết hợp với chữ Tự 寺 (chùa, thanh tịnh) hài âm. Biểu thị tiếng nói phát ra từ tâm hồn thanh tịnh, cao đẹp."
  },
  {
    character: "月",
    sinoVietnamese: "Nguyệt",
    pinyin: "yuè",
    strokes: "4 nét",
    radical: "月 (nguyệt)",
    definition: "Mặt trăng; tháng (đơn vị thời gian tính theo chu kỳ mặt trăng).",
    examples: [
      { word: "月光", transcription: "Nguyệt quang", translation: "ánh trăng sáng" },
      { word: "半月", transcription: "Bán nguyệt", translation: "nửa vầng trăng" },
      { word: "岁月", transcription: "Tuế nguyệt", translation: "năm tháng qua đi" }
    ],
    analyticalNotes: "Chữ tượng hình, vẽ hình mặt trăng khuyết bán nguyệt."
  },
  {
    character: "心",
    sinoVietnamese: "Tâm",
    pinyin: "xīn",
    strokes: "4 nét",
    radical: "心 (tâm)",
    definition: "Tâm hồn; trái tim; lòng dạ; nội tâm bên trong của con người hoặc cốt lõi sự vật.",
    examples: [
      { word: "心得", transcription: "Tâm đắc", translation: "hiểu sâu sắc và vừa ý" },
      { word: "同心", transcription: "Đồng tâm", translation: "cùng một lòng chí hướng" },
      { word: "人心", transcription: "Nhân tâm", translation: "lòng người" }
    ],
    analyticalNotes: "Chữ tượng hình, vẽ hình quả tim của con người."
  },
  {
    character: "人",
    sinoVietnamese: "Nhân",
    pinyin: "rén",
    strokes: "2 nét",
    radical: "人 (nhân)",
    definition: "Người; loài người; nhân loại nói chung.",
    examples: [
      { word: "人類", transcription: "Nhân loại", translation: "loài người" },
      { word: "軍人", transcription: "Quân nhân", translation: "người lính" },
      { word: "人生", transcription: "Nhân sinh", translation: "cuộc đời con người" }
    ],
    analyticalNotes: "Chữ tượng hình, phác họa hình dáng một người đang đứng nghiêng."
  },
  {
    character: "文",
    sinoVietnamese: "Văn",
    pinyin: "wén",
    strokes: "4 nét",
    radical: "文 (văn)",
    definition: "Văn chương, chữ viết; vẻ ngoài rực rỡ, văn hóa, học hỏi tri thức.",
    examples: [
      { word: "文章", transcription: "Văn chương", translation: "văn chương nghệ thuật" },
      { word: "文學", transcription: "Văn học", translation: "khoa học văn học" },
      { word: "文化", transcription: "Văn hóa", translation: "bản sắc văn hóa dân tộc" }
    ],
    analyticalNotes: "Chữ tượng hình, khởi thủy vẽ hình các hoa văn, vệt kẻ đan chéo biểu thị ký tự."
  },
  {
    character: "國",
    sinoVietnamese: "Quốc",
    pinyin: "guó",
    strokes: "11 nét",
    radical: "囗 (vi)",
    definition: "Nước, quốc gia, lãnh thổ lãnh thổ độc lập có chủ quyền.",
    examples: [
      { word: "國家", transcription: "Quốc gia", translation: "nước nhà" },
      { word: "愛國", transcription: "Ái quốc", translation: "yêu nước" },
      { word: "王國", transcription: "Vương quốc", translation: "vương quốc" }
    ],
    analyticalNotes: "Chữ hội ý, gồm bộ Vi 囗 (vây quanh biên giới) bao ngoài chữ Hoặc 或 (vũ khí và đất đai cần bảo vệ)."
  },
  {
    character: "天",
    sinoVietnamese: "Thiên",
    pinyin: "tiān",
    strokes: "4 nét",
    radical: "大 (đại)",
    definition: "Trời; bầu trời; đấng tạo hóa hoặc ngày (đơn vị mốc thời gian).",
    examples: [
      { word: "天下", transcription: "Thiên hạ", translation: "thế gian, mọi người" },
      { word: "天然", transcription: "Thiên nhiên", translation: "tự nhiên sẵn có" },
      { word: "天空", transcription: "Thiên không", translation: "bầu trời bao la" }
    ],
    analyticalNotes: "Chữ chỉ sự, vẽ một người đứng giang tay (chữ Đại 大) phía trên có vạch ngang chỉ đỉnh đầu tối cao là bầu trời."
  },
  {
    character: "地",
    sinoVietnamese: "Địa",
    pinyin: "dì",
    strokes: "6 nét",
    radical: "土 (thổ)",
    definition: "Đất, mặt đất, bản xứ, địa phương hoặc vị trí địa lý.",
    examples: [
      { word: "地球", transcription: "Địa cầu", translation: "trái đất" },
      { word: "本地", transcription: "Bản địa", translation: "địa phương sở tại" },
      { word: "地址", transcription: "Địa chỉ", translation: "nơi ở xác định" }
    ],
    analyticalNotes: "Chữ hình thanh, bộ Thổ 土 (đất đai) chỉ nghĩa kết hợp với chữ Dã 也 hài âm."
  },
  {
    character: "日",
    sinoVietnamese: "Nhật",
    pinyin: "rì",
    strokes: "4 nét",
    radical: "日 (nhật)",
    definition: "Mặt trời; ngày; ban ngày hoặc hằng ngày.",
    examples: [
      { word: "日記", transcription: "Nhật ký", translation: "sổ tay ghi chép hằng ngày" },
      { word: "生日", transcription: "Sinh nhật", translation: "ngày sinh" },
      { word: "日光", transcription: "Nhật quang", translation: "ánh sáng mặt trời" }
    ],
    analyticalNotes: "Chữ tượng hình, vẽ hình tròn có chấm ở giữa biểu thị thái dương."
  },
  {
    character: "山",
    sinoVietnamese: "Sơn",
    pinyin: "shān",
    strokes: "3 nét",
    radical: "山 (sơn)",
    definition: "Núi, ngọn núi cao trồi lên trên mặt đất.",
    examples: [
      { word: "山河", transcription: "Sơn hà", translation: "núi sông giang sơn" },
      { word: "泰山", transcription: "Thái Sơn", translation: "ngọn núi Thái Sơn cao lớn" },
      { word: "火山", transcription: "Hỏa sơn", translation: "núi lửa" }
    ],
    analyticalNotes: "Chữ tượng hình, phác họa hình ảnh các đỉnh núi trùng điệp."
  },
  {
    character: "水",
    sinoVietnamese: "Thủy",
    pinyin: "shuǐ",
    strokes: "4 nét",
    radical: "水 (thủy)",
    definition: "Nước, chất lỏng nói chung, sông ngòi chảy cuồn cuộn.",
    examples: [
      { word: "水潮", transcription: "Thủy triều", translation: "nước biển dâng hạ" },
      { word: "山水", transcription: "Sơn thủy", translation: "phong cảnh núi và sông" },
      { word: "淡水", transcription: "Đạm thủy", translation: "nước ngọt" }
    ],
    analyticalNotes: "Chữ tượng hình, phác họa dòng nước chảy xiết và có các giọt nước bắn ra xung quanh."
  },
  {
    character: "花",
    sinoVietnamese: "Hoa",
    pinyin: "huā",
    strokes: "7 nét",
    radical: "艸 (thảo)",
    definition: "Bông hoa, bộ phận sinh sản của thực vật hoặc trang trí sặc sỡ tốt đẹp.",
    examples: [
      { word: "花紅", transcription: "Hoa hồng", translation: "hoa hồng rực" },
      { word: "蓮花", transcription: "Liên hoa", translation: "hoa sen tinh khiết" },
      { word: "花園", transcription: "Hoa viên", translation: "vườn hoa đẹp" }
    ],
    analyticalNotes: "Chữ hình thanh, bộ Thảo 艸 (cỏ cây) chỉ nghĩa kết hợp với chữ Hóa 化 hài âm."
  },
  {
    character: "風",
    sinoVietnamese: "Phong",
    pinyin: "fēng",
    strokes: "9 nét",
    radical: "風 (phong)",
    definition: "Gió, khí chuyển động hoặc phong tục, phong cách lối sống.",
    examples: [
      { word: "風景", transcription: "Phong cảnh", translation: "cảnh vật thiên nhiên thơ mộng" },
      { word: "風俗", transcription: "Phong tục", translation: "tập quán truyền đời" },
      { word: "作風", transcription: "Tác phong", translation: "phong cách làm việc" }
    ],
    analyticalNotes: "Chữ hình thanh, bên ngoài chữ Phàm 凡 hài âm, bên trong có chữ Trùng 虫 chỉ thời điểm gió thổi côn trùng sinh sôi."
  },
  {
    character: "雨",
    sinoVietnamese: "Vũ",
    pinyin: "yǔ",
    strokes: "8 nét",
    radical: "雨 (vũ)",
    definition: "Mưa, những hạt nước ngưng tụ trên mây rơi xuống đất.",
    examples: [
      { word: "雨水", transcription: "Vũ thủy", translation: "nước rớt rơi từ mưa" },
      { word: "風雨", transcription: "Phong vũ", translation: "mưa và gió dập dồn" },
      { word: "暴雨", transcription: "Bạo vũ", translation: "mưa bão to" }
    ],
    analyticalNotes: "Chữ tượng hình, nét ngang trên cùng tượng trưng cho bầu trời, nét dưới tượng trưng cho mây lành, các nét chấm là từng giọt nước mưa rơi xuống."
  },
  {
    character: "道",
    sinoVietnamese: "Đạo",
    pinyin: "dào",
    strokes: "12 nét",
    radical: "⻌ (sước)",
    definition: "Con đường rực rỡ; đạo lý luân thường, lý thuyết chính trị hoặc giáo phái triết lý.",
    examples: [
      { word: "大道", transcription: "Đại đạo", translation: "con đường lớn vĩ đại" },
      { word: "道德", transcription: "Đạo đức", translation: "phẩm hạnh đạo đức tốt đẹp" },
      { word: "通道", transcription: "Thông đạo", translation: "lối đi thông suốt" }
    ],
    analyticalNotes: "Chữ hội ý và hình thanh, phối bộ Sước ⻌ (bước đi) với chữ Thủ 首 (cái đầu, dẫn dắt trí lực)."
  },
  {
    character: "德",
    sinoVietnamese: "Đức",
    pinyin: "dé",
    strokes: "15 nét",
    radical: "彳 (xích)",
    definition: "Đạo đức nhân nghĩa, lòng tốt thiện lương, ơn nghĩa rộng lượng.",
    examples: [
      { word: "德度", transcription: "Đức độ", translation: "phẩm cách cao thượng đo lường đức" },
      { word: "功德", transcription: "Công đức", translation: "việc thiện lành đóng góp xã hội" },
      { word: "大德", transcription: "Đại đức", translation: "bậc chân tu trân quý" }
    ],
    analyticalNotes: "Chữ hội ý, gồm bộ Xích 彳 (bước đi chậm), chữ Trực 直 (ngay thẳng) đặt lên trên chữ Tâm 心 (lòng dạ). Nghĩa là hành động ngay thẳng xuất phát từ trái tim lương thiện."
  },
  {
    character: "正",
    sinoVietnamese: "Chính",
    pinyin: "zhèng",
    strokes: "5 nét",
    radical: "止 (chỉ)",
    definition: "Ngay thẳng, không lệch lạc, chính trực hoặc chính đáng hợp lẽ phải.",
    examples: [
      { word: "正直", transcription: "Chính trực", translation: "ngay thẳng bộc trực" },
      { word: "正當", transcription: "Chính đáng", translation: "phù hợp công đạo lẽ thường" },
      { word: "修改", transcription: "Chính lý", translation: "sắp xếp chỉnh tống lại cho chính xác" }
    ],
    analyticalNotes: "Chữ chỉ sự, nét ngang trên biểu thị mục tiêu đích đến dưới là chữ Chỉ 止 (dừng lại, chỗ đứng). Thể hiện sự chuẩn mực, đứng vững vàng ngay tại đích đến."
  },
  {
    character: "明",
    sinoVietnamese: "Minh",
    pinyin: "míng",
    strokes: "8 nét",
    radical: "日 (nhật)",
    definition: "Sáng, sáng sủa, thấu tỏ trí tuệ, rõ ràng bạch minh.",
    examples: [
      { word: "明白", transcription: "Minh bạch", translation: "rõ ràng sòng phẳng thấu tình đạt lý" },
      { word: "聰明", transcription: "Thông minh", translation: "nhanh nhạy, thấu đạt sâu sắc" },
      { word: "明天", transcription: "Minh thiên", translation: "ngày mai tươi sáng" }
    ],
    analyticalNotes: "Chữ hội ý, ghép chữ Nhật 日 (mặt trời) và chữ Nguyệt 月 (mặt trăng) tạo nên nguồn sáng rực rỡ nhất trần gian."
  },
  {
    character: "英",
    sinoVietnamese: "Anh",
    pinyin: "yīng",
    strokes: "8 nét",
    radical: "艸 (thảo)",
    definition: "Người tài hoa, kiệt xuất xuất chúng, tươi thắm như hoa cỏ tốt tươi, hoặc thuộc nước Anh.",
    examples: [
      { word: "英雄", transcription: "Anh hùng", translation: "người hào kiệt dũng mãnh hơn người" },
      { word: "英才", transcription: "Anh tài", translation: "người tài năng kiệt xuất" },
      { word: "精英", transcription: "Tinh anh", translation: "phần cốt túy sang trọng nhất" }
    ],
    analyticalNotes: "Chữ hình thanh, bộ Thảo 艸 (thảo mộc rực rỡ) kết hợp chữ Ương 央 hài âm."
  },
  {
    character: "雄",
    sinoVietnamese: "Hùng",
    pinyin: "húng",
    strokes: "12 nét",
    radical: "隹 (chuy)",
    definition: "Mạnh mẽ dũng mãnh, đứng vị thế dẫn đầu vượt trội hoặc biểu thị giống đực.",
    examples: [
      { word: "雄壯", transcription: "Hùng tráng", translation: "uy nghi mạnh mẽ" },
      { word: "雄偉", transcription: "Hùng vĩ", translation: "to lớn tráng lệ" },
      { word: "雌雄", transcription: "Thư hùng", translation: "giống cái và giống đực / cuộc đấu tranh tài" }
    ],
    analyticalNotes: "Chữ hình thanh, ghép chữ Chuy 隹 (chim đuôi ngắn) làm nghĩa chính biểu lộ khát vọng săn mồi mạnh mẽ dũng mãnh."
  },
  {
    character: "樂",
    sinoVietnamese: "Lạc",
    pinyin: "lè",
    strokes: "15 nét",
    radical: "木 (mộc)",
    definition: "Vui vẻ, hạnh phúc, âm nhạc hoặc tiếng đàn cầm ca vang động.",
    examples: [
      { word: "樂觀", transcription: "Lạc quan", translation: "vui vẻ tin tưởng vào đời" },
      { word: "音樂", transcription: "Âm nhạc", translation: "nghệ thuật âm thanh hòa điệu" },
      { word: "快樂", transcription: "Khoái lạc", translation: "sung sướng vui vẻ tràn đầy" }
    ],
    analyticalNotes: "Chữ tượng hình cổ, phác họa nhạc cụ bằng gõ gỗ khảm dây cung đàn phát ra âm nhạc làm say lòng người."
  },
  {
    character: "智",
    sinoVietnamese: "Trí",
    pinyin: "zhì",
    strokes: "12 nét",
    radical: "日 (nhật)",
    definition: "Trí tuệ, sự thông thái, hiểu biết sâu rộng thấu lý đạt tình.",
    examples: [
      { word: "智慧", transcription: "Trí tuệ", translation: "khả năng thấu lý vạn vật" },
      { word: "智者", transcription: "Trí giả", translation: "bậc khôn ngoan trí nhân" },
      { word: "智謀", transcription: "Trí mưu", translation: "mưu lược thấu suốt" }
    ],
    analyticalNotes: "Chữ hội ý, ghép chữ Tri 知 (hiểu biết sắc bén như cung tên) với chữ Nhật 日 (mặt trời hiển minh)."
  },
  {
    character: "信",
    sinoVietnamese: "Tín",
    pinyin: "xìn",
    strokes: "9 nét",
    radical: "人 (nhân)",
    definition: "Lòng tin vững chãi, uy tín, tin tưởng giao phó hoặc phong thư giấy tờ giao thư tín.",
    examples: [
      { word: "威信", transcription: "Uy tín", translation: "uy thế lấy được lòng tin mọi người" },
      { word: "信任", transcription: "Tín nhiệm", translation: "tin tưởng cao độ giao trọng trách" },
      { word: "信心", transcription: "Tín tâm", translation: "niềm tin nội tâm vững vàng" }
    ],
    analyticalNotes: "Chữ hội ý, ghép bộ Nhân 人 (người) và chữ Ngôn 言 (lời nói). Biểu thị ý nghĩa: Lời nói của người có đức hạnh tất phải đem lại sự tin cậy."
  },
  {
    character: "義",
    sinoVietnamese: "Nghĩa",
    pinyin: "yì",
    strokes: "13 nét",
    radical: "羊 (dương)",
    definition: "Nghĩa khí, lẽ phải đúng đắn, nghĩa vụ luân thường đạo lý xã hội.",
    examples: [
      { word: "義氣", transcription: "Nghĩa khí", translation: "tinh thần vì bạn hào hiệp nghĩa hiệp" },
      { word: "定義", transcription: "Định nghĩa", translation: "lý giải bản chất thật của khái niệm" },
      { word: "義務", transcription: "Nghĩa vụ", translation: "phần trách nhiệm đạo lý phải làm" }
    ],
    analyticalNotes: "Chữ hội ý, trên có chữ Dương 羊 (con dê béo biểu thị tính mỹ thiện), dưới có chữ Ngã 我 (bản thân). Ý nói tự rèn dũa răn đe bản thân tương ứng sự lương thiện tốt lành."
  }
];

// Shared Gemini Client Lazy Initializer
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("MY_GEMINI") || apiKey.trim() === "") {
    console.warn("⚠️ GEMINI_API_KEY is not configured or configured as a placeholder. Operating in offline dictionary mode.");
    return null;
  }
  
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    return aiClient;
  } catch (error) {
    console.error("❌ Failed to initialize GoogleGenAI client:", error);
    return null;
  }
}

// Global lookup endpoint
app.post("/api/lookup", async (req, res) => {
  const query = req.body.query?.trim();
  if (!query) {
    return res.status(400).json({ error: "Tham số tìm kiếm là bắt buộc." });
  }

  console.log(`🔍 Dictionary Lookup: "${query}"`);

  // Try using AI Gemini client if configured
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Hãy giúp tra cứu chữ Hán, phiên âm Hán-Việt hoặc nghĩa tiếng Việt liên quan đến từ khóa: "${query}".
Hãy phân loại phân tích chi tiết. Nếu từ khóa chứa cả cụm từ ghép, hãy trả về kết quả gồm cả cụm từ ghép lẫn từng từ đơn cấu thành để người học dễ hiểu. Có thể trả về tối đa 3-4 chữ liên quan.`,
        config: {
          systemInstruction: `Bạn là một chuyên gia ngôn ngữ Hán-Nôm ưu việt hàng đầu thế giới và là một cuốn Từ điển Hán-Việt bách khoa toàn thư. 
Hãy tra cứu và giải nghĩa chính xác. Luôn trả về kết quả dưới dạng JSON theo đúng schema quy định. 
Chỉ trả về JSON thuần túy, tuyệt đối không bao phủ bởi bất kỳ văn bản giải thích hay khối code markdown nào ngoài JSON.

Yêu cầu dữ liệu:
- 'results': mảng các bản ghi chữ Hán hoặc cụm Hán tự liên quan. Mỗi phần tử có:
  - 'character': Chữ Hán nguyên bản (ví dụ: 詩)
  - 'sinoVietnamese': Phiên âm Hán-Việt tương ứng (ví dụ: Thi)
  - 'pinyin': Phiên âm Latinh Trung Quốc (ví dụ: shī)
  - 'strokes': Số nét cấu thành chi tiết có hậu tố ' nét' (ví dụ: 13 nét)
  - 'radical': Bộ thủ của chữ bao gồm chữ gốc và tên giải nghĩa tương tự (ví dụ: 言 (ngôn))
  - 'definition': Giải nghĩa nghĩa tiếng Việt một cách sâu sắc, súc tích và cực kỳ rõ ràng nhất.
  - 'examples': Mảng tối thiểu 2-3 ví dụ thông dụng, mỗi ví dụ có 'word' (chữ Hán), 'transcription' (phiên âm Hán-Việt), 'translation' (nghĩa giải thích).
  - 'analyticalNotes': Chuỗi phân tích tỉ mỉ bản chất chữ Hán (như loại chữ, bộ ý âm bồi đắp).
- 'suggestedQueries': Mảng 3-4 chuỗi đề xuất các gợi ý tra cứu tiếp theo liên quan.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              results: {
                type: Type.ARRAY,
                description: "Danh sách kết quả tra cứu chi tiết chứa các chữ hán liên quan",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    character: { type: Type.STRING },
                    sinoVietnamese: { type: Type.STRING },
                    pinyin: { type: Type.STRING },
                    strokes: { type: Type.STRING },
                    radical: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    examples: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          word: { type: Type.STRING },
                          transcription: { type: Type.STRING },
                          translation: { type: Type.STRING }
                        },
                        required: ["word", "transcription", "translation"]
                      }
                    },
                    analyticalNotes: { type: Type.STRING }
                  },
                  required: ["character", "sinoVietnamese", "pinyin", "strokes", "radical", "definition", "examples"]
                }
              },
              suggestedQueries: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["results", "suggestedQueries"]
          }
        }
      });

      const responseText = response.text || "";
      const parsedData = JSON.parse(responseText.trim());
      return res.json({
        source: "AI",
        results: parsedData.results || [],
        suggestedQueries: parsedData.suggestedQueries || []
      });
    } catch (aiError) {
      console.error("❌ Gemini API lookup error:", aiError);
      // Fallback to offline search on error
    }
  }

  // Handle local offline lookup (Fallback mode)
  const normalizedQuery = query.toLowerCase();

  // Search in local offline mini database
  // Matches character exact, sino-Vietnamese substring or definition substring.
  const matched = OFFLINE_DICTIONARY.filter(item => {
    return (
      item.character === query ||
      item.sinoVietnamese.toLowerCase() === normalizedQuery ||
      item.sinoVietnamese.toLowerCase().includes(normalizedQuery) ||
      item.pinyin.toLowerCase().includes(normalizedQuery) ||
      item.definition.toLowerCase().includes(normalizedQuery) ||
      item.radical.toLowerCase().includes(normalizedQuery)
    );
  });

  if (matched.length > 0) {
    // Generate suggested queries based on matched elements
    const suggestedQueries = [
      ...new Set([
        "Tâm", "Thiên", "Quốc", "Đạo", "Đức"
      ].filter(q => q.toLowerCase() !== normalizedQuery).slice(0, 3))
    ];

    return res.json({
      source: "Offline Database - Khớp chính xác",
      results: matched,
      suggestedQueries
    });
  }

  // If no match found locally, perform fuzzy local search or return default results
  // List first 5 popular words
  const defaultResults = OFFLINE_DICTIONARY.slice(0, 3);
  return res.json({
    source: "Offline Database - Mặc định (Không tìm thấy kết quả phù hợp)",
    results: defaultResults,
    suggestedQueries: ["Thi", "Nguyệt", "Tâm", "Minh"],
    message: "Bạn đang chạy phiên bản ngoại tuyến và không tìm thấy kết quả trùng khớp cho từ khoá này. Vui lòng thử các từ khóa phổ biến khác hoặc cấu hình GEMINI_API_KEY trong Cài đặt."
  });
});

// Endpoint to fetch default offline list for sidebar explore
app.get("/api/popular", (req, res) => {
  res.json({
    source: "Offline Database",
    results: OFFLINE_DICTIONARY
  });
});

// Serve static app on production / Vite middleware on development
const isProd = process.env.NODE_ENV === "production";
if (!isProd) {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Development Full-Stack Server running on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Production Full-Stack Server running on http://localhost:${PORT}`);
  });
}
