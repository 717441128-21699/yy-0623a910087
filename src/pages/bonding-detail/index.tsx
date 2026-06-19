import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import ToothChart from '@/components/ToothChart'
import { BondingStatusTag } from '@/components/StatusTag'
import { mockBondingTasks } from '@/data/mock'
import type { BondingTask } from '@/types'

const BondingDetailPage: React.FC = () => {
  const router = useRouter()
  const [task, setTask] = useState<BondingTask | null>(null)

  useEffect(() => {
    const { id } = router.params
    const found = mockBondingTasks.find(t => t.id === id)
    if (found) {
      setTask(found)
    } else {
      Taro.showToast({ title: '记录不存在', icon: 'none' })
    }
  }, [router.params])

  const toothCountMap = useMemo(() => {
    if (!task) return {}
    const map: Record<string, number> = {}
    task.attachments.forEach(a => { map[a.toothNumber] = a.quantity })
    return map
  }, [task])

  const selectedTeeth = useMemo(() => {
    return task?.attachments.map(a => a.toothNumber) || []
  }, [task])

  const groupedMaterials = useMemo(() => {
    if (!task) return { template: [], material: [], tool: [] }
    return {
      template: task.materialChecks.filter(m => m.category === '附件模板'),
      material: task.materialChecks.filter(m => m.category === '粘接材料'),
      tool: task.materialChecks.filter(m => m.category === '辅助工具')
    }
  }, [task])

  const stats = useMemo(() => {
    if (!task) return { checked: 0, total: 0 }
    return {
      checked: task.materialChecks.filter(m => m.checked).length,
      total: task.materialChecks.length
    }
  }, [task])

  if (!task) {
    return (
      <View className={styles.page}>
        <Text className={styles.emptyText}>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.headerRow}>
          <View>
            <Text className={styles.patientName}>{task.patientName}</Text>
            <Text className={styles.patientMeta}>
              {task.caseNumber} · {task.taskDate}
            </Text>
          </View>
          <BondingStatusTag status={task.status} />
        </View>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>附件数量</Text>
            <Text className={styles.infoValue}>{task.attachments.length}颗牙</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>主治医生</Text>
            <Text className={styles.infoValue}>{task.doctorName}</Text>
          </View>
          {task.nurseName && (
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>护士</Text>
              <Text className={styles.infoValue}>{task.nurseName}</Text>
            </View>
          )}
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>创建时间</Text>
            <Text className={styles.infoValue}>{task.createdAt}</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>
          <View className={styles.titleIcon}></View>
          <Text>牙位附件分布</Text>
        </View>
        <ToothChart
          selectedTeeth={selectedTeeth}
          toothCountMap={toothCountMap}
          mode="select"
          showLegend={false}
        />
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>
          <View className={styles.titleIcon}></View>
          <Text>附件明细</Text>
        </View>
        <View className={styles.attachList}>
          {task.attachments.map(att => (
            <View key={att.toothNumber} className={styles.attachItem}>
              <View className={styles.attachTooth}>{att.toothNumber}</View>
              <View className={styles.attachInfo}>
                <Text className={styles.attachType}>{att.type}</Text>
                <Text className={styles.attachMeta}>
                  {att.direction}方向 · 共{att.quantity}个
                  {att.notes ? ` · ${att.notes}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>
          <View className={styles.titleIcon}></View>
          <Text>材料核对（{stats.checked}/{stats.total}）</Text>
        </View>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.checked}</Text>
            <Text className={styles.statLabel}>已核对</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.total - stats.checked}</Text>
            <Text className={styles.statLabel}>未核对</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.total > 0 ? Math.floor(stats.checked / stats.total * 100) : 0}%</Text>
            <Text className={styles.statLabel}>完成率</Text>
          </View>
        </View>

        <View className={styles.materialSection}>
          <Text className={styles.materialSectionTitle}>附件模板</Text>
          {groupedMaterials.template.map(m => (
            <View 
              key={m.id}
              className={`${styles.materialItem} ${m.checked ? styles.materialChecked : styles.materialUnchecked}`}
            >
              <View className={`${styles.materialIcon} ${m.checked ? styles.iconChecked : styles.iconUnchecked}`}>
                {m.checked ? '✓' : ''}
              </View>
              <Text className={styles.materialName}>{m.name}</Text>
              {m.checkedBy && (
                <Text className={styles.materialCheckedBy}>{m.checkedBy}</Text>
              )}
            </View>
          ))}
        </View>

        <View className={styles.materialSection}>
          <Text className={styles.materialSectionTitle}>粘接材料</Text>
          {groupedMaterials.material.map(m => (
            <View 
              key={m.id}
              className={`${styles.materialItem} ${m.checked ? styles.materialChecked : styles.materialUnchecked}`}
            >
              <View className={`${styles.materialIcon} ${m.checked ? styles.iconChecked : styles.iconUnchecked}`}>
                {m.checked ? '✓' : ''}
              </View>
              <Text className={styles.materialName}>{m.name}</Text>
              {m.checkedBy && (
                <Text className={styles.materialCheckedBy}>{m.checkedBy}</Text>
              )}
            </View>
          ))}
        </View>

        <View className={styles.materialSection}>
          <Text className={styles.materialSectionTitle}>辅助工具</Text>
          {groupedMaterials.tool.map(m => (
            <View 
              key={m.id}
              className={`${styles.materialItem} ${m.checked ? styles.materialChecked : styles.materialUnchecked}`}
            >
              <View className={`${styles.materialIcon} ${m.checked ? styles.iconChecked : styles.iconUnchecked}`}>
                {m.checked ? '✓' : ''}
              </View>
              <Text className={styles.materialName}>{m.name}</Text>
              {m.checkedBy && (
                <Text className={styles.materialCheckedBy}>{m.checkedBy}</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {task.photos.length > 0 && (
        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <View className={styles.titleIcon}></View>
            <Text>现场照片（{task.photos.length}张）</Text>
          </View>
          <View className={styles.photoGrid}>
            {task.photos.map((photo, idx) => (
              <View key={idx} className={styles.photoItem}>
                <Image className={styles.photoImg} src={photo} mode="aspectFill" />
              </View>
            ))}
          </View>
        </View>
      )}

      {task.notes && (
        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <View className={styles.titleIcon}></View>
            <Text>备注</Text>
          </View>
          <View className={styles.notesBox}>
            <Text className={styles.notesText}>{task.notes}</Text>
          </View>
        </View>
      )}

      {task.completedAt && (
        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <View className={styles.titleIcon}></View>
            <Text>完成信息</Text>
          </View>
          <View className={styles.notesBox}>
            <Text className={styles.notesText}>
              粘接完成时间：{task.completedAt}
              {'\n'}护士签字：{task.nurseName || '待确认'}
              {'\n'}医生签字：{task.doctorName}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default BondingDetailPage
