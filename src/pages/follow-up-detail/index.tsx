import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import ToothChart from '@/components/ToothChart'
import { ToothStatusTag } from '@/components/StatusTag'
import classnames from 'classnames'
import { mockFollowUpRecords } from '@/data/mock'
import { getToothRegion } from '@/utils'
import type { FollowUpRecord, ToothStatus } from '@/types'

const FollowUpDetailPage: React.FC = () => {
  const router = useRouter()
  const [record, setRecord] = useState<FollowUpRecord | null>(null)

  useEffect(() => {
    const { id } = router.params
    const found = mockFollowUpRecords.find(r => r.id === id)
    if (found) {
      setRecord(found)
    } else {
      Taro.showToast({ title: '记录不存在', icon: 'none' })
    }
  }, [router.params])

  const toothStatusMap = useMemo(() => {
    if (!record) return {}
    const map: Record<string, ToothStatus> = {}
    record.teeth.forEach(t => { map[t.toothNumber] = t.status })
    return map
  }, [record])

  const stats = useMemo(() => {
    if (!record) return { intact: 0, worn: 0, fallen: 0, rebond: 0 }
    const s = { intact: 0, worn: 0, fallen: 0, rebond: 0 }
    record.teeth.forEach(t => { s[t.status]++ })
    return s
  }, [record])

  const toothNumClass = (status: ToothStatus) => {
    return classnames(styles.toothNum, {
      [styles.toothNumIntact]: status === 'intact',
      [styles.toothNumWorn]: status === 'worn',
      [styles.toothNumFallen]: status === 'fallen',
      [styles.toothNumRebond]: status === 'rebond'
    })
  }

  if (!record) {
    return (
      <View className={styles.page}>
        <Text className={styles.emptyText}>加载中...</Text>
      </View>
    )
  }

  const overallStatus: { status: ToothStatus; text: string } = (() => {
    if (stats.fallen > 0 || stats.rebond > 0) return { status: 'rebond', text: '需处理' }
    if (stats.worn > 0) return { status: 'worn', text: '需关注' }
    return { status: 'intact', text: '状态良好' }
  })()

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.headerRow}>
          <View>
            <Text className={styles.patientName}>{record.patientName}</Text>
            <Text className={styles.patientMeta}>
              {record.caseNumber} · {record.visitDate}
            </Text>
          </View>
          <ToothStatusTag status={overallStatus.status} text={overallStatus.text} />
        </View>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>检查牙位</Text>
            <Text className={styles.infoValue}>{record.teeth.length}颗</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>检查医生</Text>
            <Text className={styles.infoValue}>{record.doctorName}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>记录时间</Text>
            <Text className={styles.infoValue}>{record.createdAt}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>下次复查</Text>
            <Text className={styles.infoValue}>{record.nextVisitDate}</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>
          <View className={styles.titleIcon}></View>
          <Text>牙位状态总览</Text>
        </View>
        <ToothChart
          toothStatusMap={toothStatusMap}
          mode="status"
          showLegend={true}
        />
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>
          <View className={styles.titleIcon}></View>
          <Text>检查结果汇总</Text>
        </View>
        <View className={styles.summaryRow}>
          <View className={`${styles.summaryItem} ${styles.summaryIntact}`}>
            <Text className={`${styles.summaryNum} ${styles.summaryNumIntact}`}>{stats.intact}</Text>
            <Text className={styles.summaryLabel}>完好</Text>
          </View>
          <View className={`${styles.summaryItem} ${styles.summaryWorn}`}>
            <Text className={`${styles.summaryNum} ${styles.summaryNumWorn}`}>{stats.worn}</Text>
            <Text className={styles.summaryLabel}>磨耗</Text>
          </View>
          <View className={`${styles.summaryItem} ${styles.summaryFallen}`}>
            <Text className={`${styles.summaryNum} ${styles.summaryNumFallen}`}>{stats.fallen}</Text>
            <Text className={styles.summaryLabel}>脱落</Text>
          </View>
          <View className={`${styles.summaryItem} ${styles.summaryRebond}`}>
            <Text className={`${styles.summaryNum} ${styles.summaryNumRebond}`}>{stats.rebond}</Text>
            <Text className={styles.summaryLabel}>需重粘</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>
          <View className={styles.titleIcon}></View>
          <Text>逐牙检查详情</Text>
        </View>
        <View className={styles.toothList}>
          {record.teeth.map(t => (
            <View key={t.toothNumber} className={styles.toothItem}>
              <View className={toothNumClass(t.status)}>
                {t.toothNumber}
              </View>
              <View className={styles.toothInfo}>
                <Text className={styles.toothType}>
                  {getToothRegion(t.toothNumber)} · {t.previousType || '未知类型'}
                </Text>
                <Text className={styles.toothMeta}>
                  <ToothStatusTag status={t.status} />
                </Text>
                {t.notes && (
                  <Text className={styles.toothNotes}>
                    💬 {t.notes}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {record.doctorOpinion && (
        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <View className={styles.titleIcon}></View>
            <Text>医生处理意见</Text>
          </View>
          <View className={styles.opinionBox}>
            <Text className={styles.opinionText}>
              {record.doctorOpinion}
            </Text>
          </View>
        </View>
      )}

      <View className={styles.card}>
        <View className={styles.footerRow}>
          <View className={styles.footerItem}>
            <Text className={styles.footerLabel}>下次复查时间</Text>
            <Text className={`${styles.footerValue} ${styles.footerValuePrimary}`}>
              {record.nextVisitDate}
            </Text>
          </View>
          <View className={styles.footerItem} style={{ textAlign: 'right' }}>
            <Text className={styles.footerLabel}>医生签字</Text>
            <Text className={styles.footerValue}>{record.doctorName}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default FollowUpDetailPage
