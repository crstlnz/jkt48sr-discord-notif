declare namespace Watcher {
    interface Member {
      id: number
      name: string
      roomKey: string
      roomExists: boolean
      isActive: boolean
    }
  
    interface Data {
      id: number
      name: string
      roomKey: string
      live_type: number
      live_id: number
      socketData: {
        host: string
        key: string
      }
      bg: string
      image: string
      startedAt: number
      giftList?: ShowroomAPI.Gift[]
      giftLog?: ShowroomAPI.GiftLogItem[]
      penonton?: Penonton
      users?: User[]
      stageList?: Database.IStage[]
      data_id?: string
      screenshots?: Database.IScreenshot
      messages?: Message[]
      recordDates?: RecordDate[]
      comments?: Watcher.Comment[]
    }
  
    interface RecordDate {
      from: Date
      to: Date
    }
  
    interface Message {
      channelId: string
      messageId: string
    }
  
    interface StageUser {
      order_no: number
      user: {
        avatar_id: number
        badge_type: number
        badge: number
        avatar_url: string
        name: string
        user_id: number
        image: string
      }
      rank: number
    }
  
    interface PenontonHistory {
      num: number
      waktu: Date
    }
  
    interface Penonton {
      history: PenontonHistory[]
      peak: number
    }
  
    interface User {
      avatar_url: string
      user_id: number
      name: string
      point: number
      image: string
    }
  
    interface Comment {
      user_id: number
      avatar_id: number
      name: string
      comment: string
      created_at: number
    }
  }