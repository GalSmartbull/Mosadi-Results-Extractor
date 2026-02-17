
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "../types";

const SYSTEM_PROMPT = `
אתה סוכן מומחה לניתוח תוצאות מכרזים מוסדיים של הבורסה לניירות ערך (מערכת מאיה).
תפקידך לסרוק את ה-PDF המצורף ולחלץ נתונים עבור כל נייר ערך או סדרה המופיעים בדוח כחלק מהנפקה/הרחבה.

הנחיות לוגיות לזיהוי וחילוץ:
1. זיהוי מספר ניירות ערך: דוחות מסוימים כוללים תוצאות עבור מספר סדרות במקביל (למשל: סדרה א', סדרה ב' וסדרה ג'). עליך ליצור אובייקט נפרד לכל נייר ערך/סדרה שמונפקת.
2. שם נייר הערך (securityName): עליך להרכיב את השם בפורמט: [שם החברה המנפיקה] - [פירוט נייר הערך/הסדרה].
   - דוגמה: "בנק לאומי - סדרה 406" או "פועלים - אג"ח 200".
3. חבילות ויחידות (Bundles): אם המכרז מתבצע על "חבילה" או "יחידה" הכוללת מספר ניירות ערך יחד (למשל מניה + אופציה), אל תשתמש במילה "יחידות" כשם נייר הערך. עליך לתאר את הרכב החבילה.
   - דוגמה: במקום "שיכון ובינוי אנרגיה - יחידות", השתמש ב-"שיכון ובינוי אנרגיה - מניות + כתבי אופציה 1".
   - התייחס לחבילה כנייר ערך אחד וחלץ את הלימיט והכמויות עבור החבילה כולה.
4. הבחנה בין סוגי מכרזים:
   - מכרזי ריבית/מרווח: הביקוש בשקלים הוא לרוב (ביקוש ביחידות * 1000). אם לא צוין אחרת, חשב לפי לוגיקה זו.
   - מכרזי מחיר: אם סך הביקושים בשקלים לא מפורט מפורשות, החזר 0 בערך "totalValueBid".
5. המרת מספרים: המר תמיד מיליוני ש"ח למספר המלא (100 מיליון -> 100,000,000).

שדות לחילוץ עבור כל נייר ערך:
- שם נייר ערך (securityName) - חייב לכלול את שם החברה ואת התיאור המלא של הסדרה או החבילה.
- ביקוש ביחידות (totalUnitsBid)
- ביקוש בשקלים (totalValueBid) - אם לא קיים במכרז מחיר, החזר 0.
- לימיט סגירה (closingPrice) - מחיר היחידה או הריבית/מרווח שנקבעו.
- היקף הנפקה ביחידות (allocatedUnits)
- היקף הנפקה בשקלים / תמורה (totalProceeds)

החזר אך ורק JSON תקין לפי הסכימה המבוקשת.
`;

export async function analyzeTenderPDF(fileBase64: string, fileName: string): Promise<ExtractionResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: fileBase64,
            },
          },
          {
            text: `נתח את קובץ המכרז המצורף: ${fileName}. חלץ את כל ניירות הערך המופיעים בדוח בנפרד. אם מדובר בחבילה/יחידה, תאר את הרכבה בשם נייר הערך.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          securities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                securityName: {
                  type: Type.STRING,
                  description: 'Issuer Name - Full Security/Package Description (e.g. "Company - Shares + Options 1")',
                },
                totalUnitsBid: {
                  type: Type.NUMBER,
                  description: 'Total units bid',
                },
                totalValueBid: {
                  type: Type.NUMBER,
                  description: 'Total value bid (0 if price tender and not specified)',
                },
                closingPrice: {
                  type: Type.NUMBER,
                  description: 'Closing limit (Price/Interest/Spread)',
                },
                allocatedUnits: {
                  type: Type.NUMBER,
                  description: 'Allocated units',
                },
                totalProceeds: {
                  type: Type.NUMBER,
                  description: 'Total proceeds in NIS',
                },
              },
              required: ["securityName", "totalUnitsBid", "totalValueBid", "closingPrice", "allocatedUnits", "totalProceeds"],
            }
          }
        },
        required: ["securities"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No data extracted from PDF");
  
  try {
    return JSON.parse(text) as ExtractionResult;
  } catch (e) {
    console.error("Failed to parse Gemini JSON output:", text);
    throw new Error("Invalid response format from AI");
  }
}
