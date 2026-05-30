import { getApiUrl } from "../lib/api";
import { DefectType, Severity, DetectedDefect } from "../types";

/**
 * Analyzes track image through server-side Gemini API proxy.
 * This keeps the API key secure and prevents browser environment errors.
 */
export async function analyzeTrackImage(base64Image: string): Promise<{ defects: DetectedDefect[], summary: string }> {
  try {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(getApiUrl('/api/ai/analyze'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ image: base64Image })
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        
        // Specific error handling for the UI
        if (data.error === 'AI_KEY_MISSING') {
          throw new Error("تكوين النظام غير مكتمل: مفتاح الذكاء الاصطناعي (Gemini API Key) غير مهيأ حالياً في إعدادات الخادم. يمكنك إدخاله في الـ Settings أو تشغيل وضع المحاكاة.");
        }
        
        throw new Error(data.message || "فشل تحليل الصورة. يرجى المحاولة مرة أخرى.");
      } else {
        const text = await response.text();
        if (text.includes('<!DOCTYPE') || response.status === 404 || response.status >= 500) {
          throw new Error("خطأ في الاتصال بالخدمة: خادم التحليل قيد التشغيل والتهيئة ولكنه يحتاج لمفتاح API مفعل. يرجى تهيئة مفتاح Gemini في إعدادات المنصة أو استخدام زر 'تشغيل وضع المحاكاة' الفوري.");
        }
        throw new Error(`خطأ في الاستجابة (${response.status}): ${response.statusText || 'تأكد من الاتصالات'}`);
      }
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error("استجابة الخادم غير صالحة. يرجى استخدام محاكاة التشخيص أو إعادة المحاولة.");
    }

    const result = await response.json();
    
    // Map JSON results to our app interface
    const defects: DetectedDefect[] = result.defects.map((d: any, index: number) => ({
      id: `defect-${Date.now()}-${index}`,
      type: d.type as DefectType,
      severity: d.severity as Severity,
      confidence: d.confidence || 0.9,
      description: d.description || "No description provided",
      box: {
        ymin: d.box_2d ? d.box_2d[0] : 0,
        xmin: d.box_2d ? d.box_2d[1] : 0,
        ymax: d.box_2d ? d.box_2d[2] : 1000,
        xmax: d.box_2d ? d.box_2d[3] : 1000
      }
    }));

    return {
      defects,
      summary: result.summary || "No summary available"
    };
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // Rethrow with user-friendly message
    if (error.message.includes('Failed to fetch')) {
      throw new Error("تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.");
    }
    throw error;
  }
}
