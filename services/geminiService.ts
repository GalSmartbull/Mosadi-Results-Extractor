
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, ShelfExtractionResult, PrivatePlacementExtractionResult } from "../types";

const ENTITY_BANK = `אוריון, אי בי אי, יוניקורן, קומפאס רוז, אינפין, איפקס, אקטיב חיתום, אקסימוס, האנטר קפיטל, לידר, ברק לאומי, דיסקונט, ווליו בייס, גיזה, הפניקס, הפניקס חיתום, ברק קפיטל, אקסטרה מייל, קומפאס, רוסאריו, מנורה, מגדל, אפסילון, אוניקס, אקסלנס, אר.אי, אופנהיימר, פיור אקוויטי, NSL, סייבל, יאיר קפיטל, סיטיגרופ, UBS, ג'פריס, לאומי פרטנרס, מיטב טרייד, מיטב דש, בנק לאומי, מזרחי, אגוד, פועלים, בינלאומי.`;

const TENDER_SYSTEM_PROMPT = `
אתה סוכן מומחה לניתוח תוצאות מכרזים מוסדיים (מערכת מאיה).
תפקידך לחלץ נתונים כמותיים וזהות גופים.

כללים לזיהוי גופים (רכזים/חתמים):
- עליך להשתמש אך ורק בשמות מתוך בנק הגופים הבא: ${ENTITY_BANK}
- בצע נורמליזציה מחמירה: השם "אי בי אי (IBI)" או "אי.בי.אי" חייב להיכתב כ-"אי בי אי" בלבד.
- אם גוף לא מופיע בבנק, השאר שדה ריק.

הנחיות חילוץ:
1. שם נייר הערך: [חברה] - [סדרה/נייר].
2. המר מיליוני ש"ח למספרים מלאים.
`;

const SHELF_SYSTEM_PROMPT = `
אתה סוכן מומחה לניתוח דוחות הצעת מדף של הבורסה לניירות ערך.
עליך לסרוק את ה-PDF, כולל הערות שוליים (Footnotes) ונספחים, כדי לזהות את תנאי ההנפקה עבור כל סדרה בנפרד.

חוקי ברזל לזהות גופים (רכז, מפיץ מוביל, מפיצי משנה):
1. בנק גופים מחייב: מותר להכניס לשדות אלו אך ורק ערכים המופיעים במדויק בבנק הבא: ${ENTITY_BANK}.
2. נורמליזציה: השם "אי בי אי (IBI)" או "IBI" או "אי.בי.אי" חייב להיכתב אך ורק כ-"אי בי אי".
3. מפיץ מוביל (leadUnderwriter) לעומת משנה: 
   - זהה את המפיץ המוביל.
   - חלץ מפיצי משנה מהערות השוליים (למשל הערה 12 בדוח הכשרת הישוב).
   - **חוק:** המפיץ המוביל לא יופיע בשום פנים ואופן ברשימת מפיצי המשנה (subDistributors). הסר אותו משם אם הוא מופיע בטקסט.
4. יועץ הנפקה (offeringAdvisor): השאר ריק אלא אם כן נכתב במפורש בטקסט "יועץ הנפקה" או "יועץ". אל תסיק תפקיד זה משום תפקיד אחר.
5. איסור על ערכים מחוץ לבנק: אל תכניס שום גוף לרכז או חתם שאינו מופיע בבנק הגופים.

הנחיות כמות מוצעת (offeredQuantity):
- חובה לחפש סעיף המתחיל במילים "על אף האמור לעיל" (או נוסח דומה המעדכן את הכמות המוצעת לציבור).
- אם סעיף כזה קיים, חלץ ממנו את הכמות המעודכנת המוצעת לציבור ביחידות.
- אם לא קיים סעיף כזה, חלץ את הכמות הראשונית המופיעה בדוח.
- **חשוב:** הכמות חייבת להיות ביחידות בלבד! אל תשתמש בערכי ש"ח ע.נ.

הנחיות לוגיות נוספות:
- זיהוי סדרות נפרדות: צור אובייקט נפרד לכל נייר ערך/סדרה.
- עמלת ריכוז (concentrationFee): אם מופיע סכום גלובלי (למשל 25,000 ש"ח) לכל הדוח הכולל מספר סדרות, חלק את הסכום שווה בשווה בין כל הסדרות שחילצת.
- טבלת זוכים: חלץ את הטבלה הרלוונטית לכל סדרה. עמודות: investorName, allocatedQuantity, bidLimit, investorType, notes.

עמלות: אחוזים (%) בלבד. דלג על "עמלת התחייבות".

החזר JSON תקין במבנה של אובייקט המכיל מערך בשם offerings.
`;

const PRIVATE_PLACEMENT_SYSTEM_PROMPT = `
אתה סוכן מומחה לניתוח דוחות הנפקה פרטית של הבורסה לניירות ערך (מערכת מאיה).
תפקידך לחלץ נתונים מתוך דוח תוצאות הנפקה פרטית.

הנחיות חילוץ:
1. שם החברה: שם החברה המדווחת.
2. שם נייר הערך: שם נייר הערך המונפק (למשל אג"ח סדרה א').
3. מספר נייר הערך: מספר הנייר כפי שמופיע בדוח.
4. תאריך מכרז: תאריך ההודעה או תאריך המכרז המופיע בדוח.
5. כמות מונפקת: כמות היחידות או ע"נ שהונפק בפועל.
6. מחיר ההנפקה: מחיר ההנפקה בש"ח. **חשוב:** אם המחיר מופיע באגורות, עליך להמיר אותו לש"ח (לחלק ב-100).
7. הערות: הוסף הערות רלוונטיות למשתמש לגבי הנתונים שחולצו (למשל: "המחיר הומר מאגורות לש"ח", "הכמות כוללת אופציות", וכו').

החזר JSON תקין במבנה של אובייקט המכיל מערך בשם placements.
`;

export async function analyzeTenderPDF(fileBase64: string, fileName: string): Promise<ExtractionResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ inlineData: { mimeType: 'application/pdf', data: fileBase64 } }, { text: `Analyze tender results in ${fileName}` }] }],
    config: {
      systemInstruction: TENDER_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          securities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                securityName: { type: Type.STRING },
                totalUnitsBid: { type: Type.NUMBER },
                totalValueBid: { type: Type.NUMBER },
                closingPrice: { type: Type.NUMBER },
                allocatedUnits: { type: Type.NUMBER },
                totalProceeds: { type: Type.NUMBER },
              },
              required: ["securityName", "totalUnitsBid", "totalValueBid", "closingPrice", "allocatedUnits", "totalProceeds"],
            }
          }
        },
        required: ["securities"],
      },
    },
  });
  return JSON.parse(response.text) as ExtractionResult;
}

export async function analyzeShelfOfferingPDF(fileBase64: string, fileName: string): Promise<ShelfExtractionResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ 
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: fileBase64 } }, 
        { text: `נתח דוח מדף: ${fileName}. הקפד על נורמליזציה ל-"אי בי אי", חפש סעיף "על אף האמור לעיל" עבור כמות מוצעת ביחידות, מנע כפילות מפיץ מוביל/משנה וחלק עמלת ריכוז.` }
      ] 
    }],
    config: {
      systemInstruction: SHELF_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          offerings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                securityName: { type: Type.STRING },
                publicTenderDate: { type: Type.STRING },
                leadUnderwriter: { type: Type.STRING },
                subDistributors: { type: Type.STRING },
                distributionFee: { type: Type.STRING },
                successFee: { type: Type.STRING },
                underwritingFee: { type: Type.STRING },
                offeringAdvisor: { type: Type.STRING },
                advisoryFee: { type: Type.STRING },
                concentrationFee: { type: Type.STRING },
                offeringCoordinator: { type: Type.STRING },
                offeredQuantity: { type: Type.STRING },
                openingLimit: { type: Type.STRING },
                feesNotes: { type: Type.STRING },
                winnersTable: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      investorName: { type: Type.STRING },
                      allocatedQuantity: { type: Type.STRING },
                      bidLimit: { type: Type.STRING },
                      investorType: { type: Type.STRING },
                      notes: { type: Type.STRING },
                    },
                    required: ["investorName", "allocatedQuantity", "bidLimit", "investorType", "notes"],
                  }
                }
              },
              required: [
                "securityName", "publicTenderDate", "leadUnderwriter", "distributionFee", 
                "offeringAdvisor", "offeringCoordinator", "offeredQuantity", "openingLimit", "feesNotes", "winnersTable"
              ],
            }
          }
        },
        required: ["offerings"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No data extracted from PDF");
  return JSON.parse(text) as ShelfExtractionResult;
}

export async function analyzePrivatePlacementPDF(fileBase64: string, fileName: string): Promise<PrivatePlacementExtractionResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ 
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: fileBase64 } }, 
        { text: `נתח דוח תוצאות הנפקה פרטית: ${fileName}. חלץ שם חברה, שם ני"ע, מספר ני"ע, תאריך, כמות ומחיר (המר לש"ח אם באגורות).` }
      ] 
    }],
    config: {
      systemInstruction: PRIVATE_PLACEMENT_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          placements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                companyName: { type: Type.STRING },
                securityName: { type: Type.STRING },
                securityNumber: { type: Type.STRING },
                tenderDate: { type: Type.STRING },
                issuedQuantity: { type: Type.STRING },
                issuePrice: { type: Type.STRING },
                notes: { type: Type.STRING },
              },
              required: ["companyName", "securityName", "securityNumber", "tenderDate", "issuedQuantity", "issuePrice", "notes"],
            }
          }
        },
        required: ["placements"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No data extracted from PDF");
  return JSON.parse(text) as PrivatePlacementExtractionResult;
}
