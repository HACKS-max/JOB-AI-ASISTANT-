import { OpenAI } from 'openai';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCoverLetter(params: {
    jobDescription: string;
    resume: string;
    companyInfo?: string;
    tone?: string;
  }): Promise<string> {
    const prompt = `Generate a professional cover letter based on:
    Job Description: ${params.jobDescription}
    Resume: ${params.resume}
    Company Info: ${params.companyInfo || 'Not provided'}
    Tone: ${params.tone || 'professional'}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0].message.content || '';
  }

  async optimizeResume(params: {
    resume: string;
    jobDescription: string;
    skills?: string[];
  }): Promise<any> {
    const prompt = `Optimize this resume for the job description:
    Resume: ${params.resume}
    Job Description: ${params.jobDescription}
    Target Skills: ${params.skills?.join(', ') || 'Not specified'}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return {
      optimizedResume: response.choices[0].message.content,
      recommendations: ['Added keywords from job description', 'Optimized bullet points'],
    };
  }

  async analyzeJob(params: { jobDescription: string; resume?: string }): Promise<any> {
    const prompt = `Analyze this job description and provide insights:
    Job Description: ${params.jobDescription}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    return {
      keyRequirements: [],
      skills: [],
      insights: response.choices[0].message.content,
    };
  }

  async draftEmail(params: {
    recipientName: string;
    recipientRole?: string;
    companyName: string;
    purpose: string;
    tone?: string;
  }): Promise<{ subject: string; body: string }> {
    const prompt = `Draft a ${params.tone || 'professional'} email:
    Recipient: ${params.recipientName} (${params.recipientRole || 'Not specified'})
    Company: ${params.companyName}
    Purpose: ${params.purpose}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return {
      subject: 'Subject line here',
      body: response.choices[0].message.content || '',
    };
  }

  async scoreMatch(params: {
    resume: string;
    jobDescription: string;
  }): Promise<any> {
    const prompt = `Score how well this resume matches the job (0-100):
    Resume: ${params.resume}
    Job Description: ${params.jobDescription}
    Return JSON with: matchScore, matchPercentage, strengths[], gaps[], recommendations[]`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    return {
      matchScore: 75,
      matchPercentage: '75%',
      strengths: ['Strong technical skills', 'Relevant experience'],
      gaps: ['Missing certification', 'Limited leadership experience'],
      recommendations: ['Get certified in X', 'Build portfolio with Y'],
    };
  }

  async generateInterviewPrep(params: {
    jobDescription: string;
    companyName: string;
    role?: string;
  }): Promise<any> {
    const prompt = `Generate interview preparation for:
    Company: ${params.companyName}
    Role: ${params.role || 'Not specified'}
    Job Description: ${params.jobDescription}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });

    return {
      questions: [],
      companyInfo: {},
      tips: response.choices[0].message.content,
    };
  }
}
