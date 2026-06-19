import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import styles from './index.module.scss'
import ToothChart from '@/components/ToothChart'
import { ToothStatusTag } from '@/components/StatusTag'
import classnames from 'classnames'
import { 
  mockPatients, 
  defaultPrecautions,
  defaultDiscomforts
} from '@/data/mock'
import { generateId, getToothRegion } from '@/utils'
import { 
  getFollowUpRecords, addFollowUpRecord, 
  getPatientBondingHistory, getPatientFollowUpHistory,
  hasPatientBondingHistory
} from '@/services/store'
import type { 
  Patient, FollowUpRecord, FollowUpTooth, 
  ToothStatus, ToothAttachment
} from '@/types'

type TabType = 'list' | 'create'

const STATUS_OPTIONS: { key: ToothStatus; label: string }[] = [
  { key: 'intact', label: '完好' },
  { key: 'worn', label: '磨耗' },
  { key: 'fallen', label: '脱落' },
  { key: 'rebond', label: '需重粘' }
]

const addDays = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

const FollowUpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [records, setRecords] = useState<FollowUpRecord[]>([])
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showCardModal, setShowCardModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [completedRecord, setCompletedRecord] = useState<FollowUpRecord | null>(null)
  const [patientSearch, setPatientSearch] = useState('')

  // 表单状态
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [prevAttachments, setPrevAttachments] = useState<ToothAttachment[]>([])
  const [teeth, setTeeth] = useState<FollowUpTooth[]>([])
  const [toothStatusMap, setToothStatusMap] = useState<Record<string, ToothStatus>>({})
  const [toothNotesMap, setToothNotesMap] = useState<Record<string, string>>({})
  const [editingTooth, setEditingTooth] = useState<string | null>(null)
  const [doctorOpinion, setDoctorOpinion] = useState('')
  const [nextVisitDate, setNextVisitDate] = useState(addDays(14))

  useDidShow(() => {
    setRecords(getFollowUpRecords())

    const patient: Patient | null = Taro.getStorageSync('currentPatient')
    if (patient) {
      loadPatientHistory(patient)
      setActiveTab('create')
      Taro.removeStorageSync('currentPatient')
    }
  })

  const loadPatientHistory = (patient: Patient) => {
    setSelectedPatient(patient)
    const bondingHistory = getPatientBondingHistory(patient.id)
    const followupHistory = getPatientFollowUpHistory(patient.id)
    
    const attachMap: Record<string, ToothAttachment> = {}
    
    bondingHistory.forEach(task => {
      task.attachments.forEach(att => {
        attachMap[att.toothNumber] = att
      })
    })
    
    followupHistory.forEach(record => {
      record.teeth.forEach(t => {
        if (t.status === 'rebond' && attachMap[t.toothNumber]) {
          // 保留重粘记录
        }
      })
    })

    const attList = Object.values(attachMap)
    setPrevAttachments(attList)
    
    const initialTeeth: FollowUpTooth[] = attList.map(att => ({
      toothNumber: att.toothNumber,
      status: 'intact',
      previousType: att.type
    }))
    setTeeth(initialTeeth)
    
    const statusMap: Record<string, ToothStatus> = {}
    initialTeeth.forEach(t => { statusMap[t.toothNumber] = 'intact' })
    setToothStatusMap(statusMap)
    setToothNotesMap({})
  }

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return mockPatients
    const kw = patientSearch.trim().toLowerCase()
    return mockPatients.filter(p => 
      p.name.toLowerCase().includes(kw) || p.caseNumber.toLowerCase().includes(kw)
    )
  }, [patientSearch])

  const stats = useMemo(() => {
    const s = { intact: 0, worn: 0, fallen: 0, rebond: 0 }
    Object.values(toothStatusMap).forEach(status => {
      s[status]++
    })
    return s
  }, [toothStatusMap])

  const handleSelectPatient = (patient: Patient) => {
    loadPatientHistory(patient)
    setShowPatientModal(false)
    setPatientSearch('')
    setDoctorOpinion('')
    setNextVisitDate(addDays(14))
  }

  const handleToothClick = (toothNumber: string) => {
    if (!toothStatusMap[toothNumber]) return
    setEditingTooth(toothNumber)
  }

  const handleStatusChange = (toothNumber: string, status: ToothStatus) => {
    setToothStatusMap(prev => ({ ...prev, [toothNumber]: status }))
    setTeeth(prev => prev.map(t => 
      t.toothNumber === toothNumber ? { ...t, status } : t
    ))
  }

  const handleToothNotesChange = (toothNumber: string, notes: string) => {
    setToothNotesMap(prev => ({ ...prev, [toothNumber]: notes }))
  }

  const handleCloseEdit = () => {
    setEditingTooth(null)
  }

  const handleSaveRecord = () => {
    if (!selectedPatient) {
      Taro.showToast({ title: '请先选择患者', icon: 'none' })
      return
    }
    if (teeth.length === 0) {
      Taro.showToast({ title: '该患者暂无历史附件记录', icon: 'none' })
      return
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    const finalTeeth: FollowUpTooth[] = teeth.map(t => ({
      ...t,
      status: toothStatusMap[t.toothNumber] || 'intact',
      notes: toothNotesMap[t.toothNumber] || undefined
    }))

    const record: FollowUpRecord = {
      id: generateId(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      caseNumber: selectedPatient.caseNumber,
      visitDate: today,
      teeth: finalTeeth,
      doctorOpinion,
      nextVisitDate,
      doctorName: '王医生',
      createdAt: now.toLocaleString()
    }

    addFollowUpRecord(record)
    setRecords(getFollowUpRecords())
    setCompletedRecord(record)
    setShowCardModal(true)
    
    Taro.showToast({ title: '保存成功', icon: 'success' })
  }

  const getRecordStats = (record: FollowUpRecord) => {
    const s = { intact: 0, worn: 0, fallen: 0, rebond: 0 }
    record.teeth.forEach(t => { s[t.status]++ })
    return s
  }

  const handleRecordClick = (record: FollowUpRecord) => {
    Taro.navigateTo({
      url: `/pages/follow-up-detail/index?id=${record.id}`
    })
  }

  const quickDates = [
    { label: '1周后', days: 7 },
    { label: '2周后', days: 14 },
    { label: '3周后', days: 21 },
    { label: '4周后', days: 28 },
    { label: '6周后', days: 42 },
    { label: '8周后', days: 56 }
  ]

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        <View 
          className={classnames(styles.tabItem, activeTab === 'list' && styles.tabActive)}
          onClick={() => setActiveTab('list')}
        >
          记录列表
        </View>
        <View 
          className={classnames(styles.tabItem, activeTab === 'create' && styles.tabActive)}
          onClick={() => setActiveTab('create')}
        >
          新建复核
        </View>
      </View>

      {activeTab === 'list' ? (
        <ScrollView scrollY className={styles.content}>
          {records.length > 0 ? records.map(record => {
            const s = getRecordStats(record)
            return (
              <View 
                key={record.id} 
                className={styles.recordCard}
                onClick={() => handleRecordClick(record)}
              >
                <View className={styles.recordHeader}>
                  <View>
                    <Text className={styles.recordPatient}>{record.patientName}</Text>
                    <Text className={styles.recordCase}>{record.caseNumber}</Text>
                  </View>
                  <ToothStatusTag status={
                    s.fallen > 0 || s.rebond > 0 ? 'rebond' : s.worn > 0 ? 'worn' : 'intact'
                  } text={
                    s.fallen > 0 || s.rebond > 0 ? '需处理' : s.worn > 0 ? '需关注' : '状态良好'
                  } />
                </View>

                <View className={styles.recordMeta}>
                  <View className={styles.recordMetaItem}>
                    <Text>📅</Text>
                    <Text>复诊：{record.visitDate}</Text>
                  </View>
                  <View className={styles.recordMetaItem}>
                    <Text>👨‍⚕️</Text>
                    <Text>{record.doctorName}</Text>
                  </View>
                  <View className={styles.recordMetaItem}>
                    <Text>⏭️</Text>
                    <Text>下次：{record.nextVisitDate}</Text>
                  </View>
                </View>

                <View className={styles.recordSummary}>
                  {s.intact > 0 && <Text className={`${styles.recordSummaryTag} ${styles.summaryIntact}`}>完好 {s.intact}</Text>}
                  {s.worn > 0 && <Text className={`${styles.recordSummaryTag} ${styles.summaryWorn}`}>磨耗 {s.worn}</Text>}
                  {s.fallen > 0 && <Text className={`${styles.recordSummaryTag} ${styles.summaryFallen}`}>脱落 {s.fallen}</Text>}
                  {s.rebond > 0 && <Text className={`${styles.recordSummaryTag} ${styles.summaryRebond}`}>重粘 {s.rebond}</Text>}
                </View>

                {record.doctorOpinion && (
                  <View className={styles.recordOpinion}>
                    <Text className={styles.recordOpinionText}>
                      💬 {record.doctorOpinion}
                    </Text>
                  </View>
                )}
              </View>
            )
          }) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🔍</Text>
              <Text className={styles.emptyText}>暂无复诊记录</Text>
              <View className={styles.emptyBtn} onClick={() => setActiveTab('create')}>
                新建复核
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView scrollY className={styles.content}>
          <View className={styles.formCard}>
            <View className={styles.formTitle}>
              <View className={styles.formTitleIcon}></View>
              <Text>1. 选择患者</Text>
            </View>
            <View 
              className={styles.selectPatient}
              onClick={() => setShowPatientModal(true)}
            >
              {selectedPatient ? (
                <View className={styles.selectPatientInfo}>
                  <Text className={styles.selectPatientName}>
                    {selectedPatient.name} · {selectedPatient.gender} {selectedPatient.age}岁
                  </Text>
                  <Text className={styles.selectPatientMeta}>
                    {selectedPatient.caseNumber} | {selectedPatient.treatmentStage}
                  </Text>
                </View>
              ) : (
                <View className={styles.selectPatientInfo}>
                  <Text className={styles.selectPatientName} style={{ color: '#86909c' }}>
                    点击选择患者
                  </Text>
                  <Text className={styles.selectPatientMeta}>
                    选择后自动加载该患者历史附件记录
                  </Text>
                </View>
              )}
              <Text className={styles.selectArrow}>›</Text>
            </View>

            {selectedPatient && prevAttachments.length > 0 && (
              <View className={styles.prevAttachmentsHint}>
                <Text className={styles.prevAttachmentsHintText}>
                  已从历史记录中加载 <strong>{prevAttachments.length}</strong> 颗牙的附件，请逐颗检查状态。
                  其中 <strong>{prevAttachments.filter(a => a.quantity > 1).length}</strong> 颗牙含有多个附件。
                </Text>
              </View>
            )}

            {selectedPatient && prevAttachments.length === 0 && (
              <View className={styles.prevAttachmentsHint} style={{ background: '#fffbe6' }}>
                <Text className={styles.prevAttachmentsHintText} style={{ color: '#faad14' }}>
                  ⚠️ 该患者暂无粘接历史记录，请先完成粘接任务后再进行复诊。
                </Text>
              </View>
            )}
          </View>

          {selectedPatient && prevAttachments.length > 0 && (
            <>
              <View className={styles.formCard}>
                <View className={styles.formTitle}>
                  <View className={styles.formTitleIcon}></View>
                  <Text>2. 牙位状态总览（点击可编辑详情）</Text>
                </View>
                <ToothChart
                  toothStatusMap={toothStatusMap}
                  mode="status"
                  onToothClick={handleToothClick}
                  showLegend={true}
                />
              </View>

              <View className={styles.formCard}>
                <View className={styles.formTitle}>
                  <View className={styles.formTitleIcon}></View>
                  <Text>3. 逐颗检查</Text>
                </View>
                <View className={styles.toothList}>
                  {teeth.map(t => {
                    const region = getToothRegion(t.toothNumber)
                    return (
                      <View key={t.toothNumber} className={styles.toothListItem}>
                        <View 
                          className={styles.toothNum}
                          style={{
                            borderColor: (() => {
                              const st = toothStatusMap[t.toothNumber] || 'intact'
                              const colors: Record<ToothStatus, string> = {
                                intact: '#52c41a', worn: '#faad14',
                                fallen: '#ff4d4f', rebond: '#1677ff'
                              }
                              return colors[st]
                            })(),
                            background: (() => {
                              const st = toothStatusMap[t.toothNumber] || 'intact'
                              const colors: Record<ToothStatus, string> = {
                                intact: '#f6ffed', worn: '#fffbe6',
                                fallen: '#fff2f0', rebond: '#e6f4ff'
                              }
                              return colors[st]
                            })(),
                            color: (() => {
                              const st = toothStatusMap[t.toothNumber] || 'intact'
                              const colors: Record<ToothStatus, string> = {
                                intact: '#52c41a', worn: '#faad14',
                                fallen: '#ff4d4f', rebond: '#1677ff'
                              }
                              return colors[st]
                            })()
                          }}
                          onClick={() => setEditingTooth(t.toothNumber)}
                        >
                          {t.toothNumber}
                        </View>
                        <View className={styles.toothInfo}>
                          <Text className={styles.toothPrevType}>
                            {region} · {t.previousType}
                            {toothNotesMap[t.toothNumber] ? ` · 💬${toothNotesMap[t.toothNumber]}` : ''}
                          </Text>
                        </View>
                        <View className={styles.toothStatusSelector}>
                          {STATUS_OPTIONS.map(opt => (
                            <View
                              key={opt.key}
                              className={classnames(
                                styles.statusBtn,
                                opt.key === 'intact' && styles.statusIntact,
                                opt.key === 'worn' && styles.statusWorn,
                                opt.key === 'fallen' && styles.statusFallen,
                                opt.key === 'rebond' && styles.statusRebond,
                                toothStatusMap[t.toothNumber] === opt.key && 'active'
                              )}
                              onClick={() => handleStatusChange(t.toothNumber, opt.key)}
                            >
                              {opt.label}
                            </View>
                          ))}
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>

              <View className={styles.formCard}>
                <View className={styles.formTitle}>
                  <View className={styles.formTitleIcon}></View>
                  <Text>4. 医生处理意见</Text>
                </View>
                <Input
                  className={styles.notesInput}
                  placeholder="请输入对本次复诊的综合处理意见、注意事项等"
                  value={doctorOpinion}
                  onInput={e => setDoctorOpinion(e.detail.value)}
                />
              </View>

              <View className={styles.formCard}>
                <View className={styles.formTitle}>
                  <View className={styles.formTitleIcon}></View>
                  <Text>5. 下次复查时间</Text>
                </View>
                <View 
                  className={styles.dateRow}
                  onClick={() => setShowDateModal(true)}
                >
                  <Text className={styles.dateLabel}>复查日期</Text>
                  <Text className={styles.dateValue}>{nextVisitDate} ›</Text>
                </View>
                <View className={styles.quickDates}>
                  {quickDates.map(qd => (
                    <View
                      key={qd.days}
                      className={styles.quickDate}
                      onClick={() => setNextVisitDate(addDays(qd.days))}
                    >
                      {qd.label}
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {activeTab === 'create' && selectedPatient && prevAttachments.length > 0 && (
        <View className={styles.bottomBar}>
          <View 
            className={classnames(styles.bottomBtn, styles.btnDefault)}
            onClick={() => {
              setSelectedPatient(null)
              setPrevAttachments([])
              setTeeth([])
              setToothStatusMap({})
              setToothNotesMap({})
              setDoctorOpinion('')
            }}
          >
            重置
          </View>
          <View 
            className={classnames(styles.bottomBtn, styles.btnPrimary)}
            onClick={handleSaveRecord}
          >
            保存并生成沟通卡
          </View>
        </View>
      )}

      {/* 患者选择弹窗 */}
      {showPatientModal && (
        <View className={styles.modalMask} onClick={() => setShowPatientModal(false)}>
          <View className={styles.modal} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择患者</Text>
              <Text className={styles.modalClose} onClick={() => setShowPatientModal(false)}>×</Text>
            </View>
            <View className={styles.modalSearch}>
              <Input
                className={styles.modalSearchInput}
                placeholder="搜索姓名或病历号"
                value={patientSearch}
                onInput={e => setPatientSearch(e.detail.value)}
              />
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              {filteredPatients.map(patient => {
                const hasHistory = hasPatientBondingHistory(patient.id)
                return (
                  <View 
                    key={patient.id}
                    className={styles.patientOption}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <View>
                      <Text className={styles.patientOptionName}>
                        {patient.name} · {patient.gender} {patient.age}岁
                        {!hasHistory && <Text style={{ fontSize: 20, color: '#faad14', marginLeft: 8 }}>（无粘接史）</Text>}
                      </Text>
                      <Text className={styles.patientOptionMeta}>
                        {patient.caseNumber} | {patient.treatmentStage}
                      </Text>
                    </View>
                    {selectedPatient?.id === patient.id && (
                      <Text className={styles.patientOptionSelected}>✓</Text>
                    )}
                  </View>
                )
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {/* 牙位详情编辑弹窗 */}
      {editingTooth && (
        <View className={styles.modalMask} onClick={handleCloseEdit}>
          <View className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxHeight: '70vh' }}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>
                {editingTooth}号牙 · {getToothRegion(editingTooth)}
              </Text>
              <Text className={styles.modalClose} onClick={handleCloseEdit}>×</Text>
            </View>
            <ScrollView scrollY style={{ padding: 32 }}>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 28, color: '#4e5969', fontWeight: 500, marginBottom: 16 }}>
                  原有附件：{teeth.find(t => t.toothNumber === editingTooth)?.previousType || '未知'}
                </Text>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 28, color: '#4e5969', fontWeight: 500, marginBottom: 16 }}>当前状态</Text>
                <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                  {STATUS_OPTIONS.map(opt => (
                    <View
                      key={opt.key}
                      style={{
                        padding: '16rpx 32rpx',
                        borderRadius: 16,
                        borderWidth: 2,
                        borderStyle: 'solid',
                        borderColor: toothStatusMap[editingTooth] === opt.key 
                          ? (opt.key === 'intact' ? '#52c41a' : opt.key === 'worn' ? '#faad14' : opt.key === 'fallen' ? '#ff4d4f' : '#1677ff')
                          : '#e5e6eb',
                        background: toothStatusMap[editingTooth] === opt.key
                          ? (opt.key === 'intact' ? '#f6ffed' : opt.key === 'worn' ? '#fffbe6' : opt.key === 'fallen' ? '#fff2f0' : '#e6f4ff')
                          : '#fff',
                        color: toothStatusMap[editingTooth] === opt.key
                          ? (opt.key === 'intact' ? '#52c41a' : opt.key === 'worn' ? '#faad14' : opt.key === 'fallen' ? '#ff4d4f' : '#1677ff')
                          : '#86909c',
                        fontSize: 28,
                        fontWeight: toothStatusMap[editingTooth] === opt.key ? 600 : 400
                      }}
                      onClick={() => handleStatusChange(editingTooth, opt.key)}
                    >
                      {opt.label}
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 28, color: '#4e5969', fontWeight: 500, marginBottom: 16 }}>备注说明</Text>
                <Input
                  style={{
                    width: '100%',
                    minHeight: 160,
                    padding: 24,
                    background: '#f5f7fa',
                    borderRadius: 12,
                    fontSize: 28,
                    boxSizing: 'border-box'
                  }}
                  placeholder="如：磨耗程度、具体脱落情况、建议处理方式等"
                  value={toothNotesMap[editingTooth] || ''}
                  onInput={e => handleToothNotesChange(editingTooth, e.detail.value)}
                />
              </View>

              <View
                style={{
                  height: 96,
                  borderRadius: 48,
                  background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 500
                }}
                onClick={handleCloseEdit}
              >
                确认
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* 复诊沟通卡弹窗 */}
      {showCardModal && completedRecord && (() => {
        const s = { intact: 0, worn: 0, fallen: 0, rebond: 0 }
        completedRecord.teeth.forEach(t => { s[t.status]++ })
        const rebondOrFallen = completedRecord.teeth.filter(t => t.status === 'fallen' || t.status === 'rebond')
        const worn = completedRecord.teeth.filter(t => t.status === 'worn')
        
        return (
          <View className={styles.modalMask} onClick={() => setShowCardModal(false)}>
            <View className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
              <View className={styles.modalHeader}>
                <Text className={styles.modalTitle}>复诊沟通卡</Text>
                <Text className={styles.modalClose} onClick={() => setShowCardModal(false)}>×</Text>
              </View>
              <ScrollView scrollY style={{ flex: 1, padding: '0 32rpx 32rpx' }}>
                <View className={styles.communicationCard}>
                  <View className={styles.cardHeader}>
                    <Text className={styles.cardHeaderTitle}>复诊检查结果</Text>
                    <Text className={styles.cardHeaderSub}>
                      {completedRecord.patientName} · {completedRecord.visitDate}
                    </Text>
                  </View>

                  <View className={styles.cardSection}>
                    <Text className={styles.cardSectionTitle}>
                      <Text className={styles.cardSectionTitleIcon}>📊</Text>
                      检查结果汇总
                    </Text>
                    <View className={styles.summaryStats}>
                      <View className={`${styles.statItem} ${styles.statIntact}`}>
                        <Text className={`${styles.statNum} ${styles.statNumIntact}`}>{s.intact}</Text>
                        <Text className={styles.statLabel}>完好</Text>
                      </View>
                      <View className={`${styles.statItem} ${styles.statWorn}`}>
                        <Text className={`${styles.statNum} ${styles.statNumWorn}`}>{s.worn}</Text>
                        <Text className={styles.statLabel}>磨耗</Text>
                      </View>
                      <View className={`${styles.statItem} ${styles.statFallen}`}>
                        <Text className={`${styles.statNum} ${styles.statNumFallen}`}>{s.fallen}</Text>
                        <Text className={styles.statLabel}>脱落</Text>
                      </View>
                      <View className={`${styles.statItem} ${styles.statRebond}`}>
                        <Text className={`${styles.statNum} ${styles.statNumRebond}`}>{s.rebond}</Text>
                        <Text className={styles.statLabel}>需重粘</Text>
                      </View>
                    </View>
                  </View>

                  {(rebondOrFallen.length > 0 || worn.length > 0) && (
                    <View className={styles.cardSection}>
                      <Text className={styles.cardSectionTitle}>
                        <Text className={styles.cardSectionTitleIcon}>👀</Text>
                        需要关注的牙位
                      </Text>
                      <View className={styles.teethList}>
                        {rebondOrFallen.map(t => (
                          <View key={t.toothNumber} className={styles.teethListItem}>
                            <View 
                              className={styles.teethListNum}
                              style={{ 
                                background: t.status === 'fallen' ? '#fff2f0' : '#e6f4ff',
                                color: t.status === 'fallen' ? '#ff4d4f' : '#1677ff'
                              }}
                            >
                              {t.toothNumber}
                            </View>
                            <Text className={styles.teethListInfo}>
                              {getToothRegion(t.toothNumber)} · {t.status === 'fallen' ? '附件已脱落' : '建议重新粘接'}
                              {t.notes ? `（${t.notes}）` : ''}
                            </Text>
                          </View>
                        ))}
                        {worn.map(t => (
                          <View key={`w-${t.toothNumber}`} className={styles.teethListItem}>
                            <View 
                              className={styles.teethListNum}
                              style={{ background: '#fffbe6', color: '#faad14' }}
                            >
                              {t.toothNumber}
                            </View>
                            <Text className={styles.teethListInfo}>
                              {getToothRegion(t.toothNumber)} · 附件有磨耗
                              {t.notes ? `（${t.notes}）` : ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {completedRecord.doctorOpinion && (
                    <View className={styles.cardSection}>
                      <Text className={styles.cardSectionTitle}>
                        <Text className={styles.cardSectionTitleIcon}>💬</Text>
                        医生处理意见
                      </Text>
                      <View className={styles.cardOpinion}>
                        <Text className={styles.cardOpinionText}>
                          {completedRecord.doctorOpinion}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View className={styles.cardSection}>
                    <Text className={styles.cardSectionTitle}>
                      <Text className={styles.cardSectionTitleIcon}>📌</Text>
                      日常注意事项
                    </Text>
                    <View className={styles.cardList}>
                      {defaultPrecautions.slice(0, 4).map((item, idx) => (
                        <Text key={idx} className={styles.cardListItem}>{item}</Text>
                      ))}
                    </View>
                  </View>

                  <View className={styles.cardSection}>
                    <Text className={styles.cardSectionTitle}>
                      <Text className={styles.cardSectionTitleIcon}>💡</Text>
                      如有以下情况属正常
                    </Text>
                    <View className={styles.cardList}>
                      {defaultDiscomforts.slice(0, 2).map((item, idx) => (
                        <Text key={idx} className={styles.cardListItem}>{item}</Text>
                      ))}
                    </View>
                  </View>

                  <View className={styles.cardFooter}>
                    <View>
                      <Text className={styles.cardFooterText}>下次复查时间</Text>
                      <Text className={styles.cardFooterDate}>
                        {completedRecord.nextVisitDate}
                      </Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                      <Text className={styles.cardFooterText}>医生签字</Text>
                      <Text className={styles.cardFooterDate}>
                        {completedRecord.doctorName}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )
      })()}
    </View>
  )
}

export default FollowUpPage
