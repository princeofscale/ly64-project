import axios from 'axios';

interface StudentsResponse {
  isValid: boolean;
  data: string[];
}


let cachedStudents: string[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; 

export class StudentsService {
  private readonly apiUrl = 'http://kpd.sarli64.ru/api/data/students.json';

  
  async getStudents(): Promise<string[]> {
    
    if (cachedStudents && Date.now() - cacheTime < CACHE_DURATION) {
      return cachedStudents;
    }

    try {
      const response = await axios.get<StudentsResponse>(this.apiUrl, {
        timeout: 10000,
        
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false,
        }),
      });

      if (response.data.isValid && Array.isArray(response.data.data)) {
        cachedStudents = response.data.data;
        cacheTime = Date.now();
        return cachedStudents;
      }

      return [];
    } catch (error) {
      console.error('Error fetching students list:', error);
      
      if (cachedStudents) {
        return cachedStudents;
      }
      return [];
    }
  }

  
  async isStudent(name: string): Promise<boolean> {
    const students = await this.getStudents();
    
    const normalizedName = name.trim().toLowerCase();
    return students.some(
      (student) => student.trim().toLowerCase() === normalizedName
    );
  }
}

export default new StudentsService();
