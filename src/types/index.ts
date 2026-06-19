// 患者信息
export interface Patient {
  id: string
  name: string
  gender: '男' | '女'
  age: number
  phone: string
  caseNumber: string
  treatmentStage: string
  nextVisitDate: string
  avatar?: string
}

// 附件类型
export type AttachmentType = 
  | '传统附件' 
  | '优化附件' 
  | '水平矩形附件' 
  | '垂直矩形附件' 
  | '椭圆附件' 
  | '三角附件'

// 附件方向
export type AttachmentDirection = '近中' | '远中' | '颊侧' | '舌侧' | '咬合面'

// 单颗牙齿的附件信息
export interface ToothAttachment {
  toothNumber: string
  type: AttachmentType
  direction: AttachmentDirection
  quantity: number
  notes?: string
}

// 材料核对项
export interface MaterialCheckItem {
  id: string
  name: string
  category: '附件模板' | '粘接材料' | '辅助工具'
  checked: boolean
  checkedAt?: string
  checkedBy?: string
}

// 粘接任务状态
export type BondingTaskStatus = 'pending' | 'materials_checked' | 'in_progress' | 'completed'

// 粘接任务
export interface BondingTask {
  id: string
  patientId: string
  patientName: string
  caseNumber: string
  taskDate: string
  status: BondingTaskStatus
  attachments: ToothAttachment[]
  materialChecks: MaterialCheckItem[]
  photos: string[]
  notes?: string
  doctorName: string
  nurseName?: string
  createdAt: string
  completedAt?: string
}

// 牙齿状态
export type ToothStatus = 'intact' | 'worn' | 'fallen' | 'rebond'

// 复诊牙齿记录
export interface FollowUpTooth {
  toothNumber: string
  status: ToothStatus
  previousType?: AttachmentType
  notes?: string
}

// 复诊记录
export interface FollowUpRecord {
  id: string
  patientId: string
  patientName: string
  caseNumber: string
  visitDate: string
  teeth: FollowUpTooth[]
  doctorOpinion: string
  nextVisitDate: string
  doctorName: string
  createdAt: string
}

// 患者沟通卡
export interface PatientCommunicationCard {
  patientName: string
  date: string
  newAttachments: ToothAttachment[]
  rebondAttachments: ToothAttachment[]
  precautions: string[]
  discomforts: string[]
  nextVisitDate: string
  doctorName: string
}
