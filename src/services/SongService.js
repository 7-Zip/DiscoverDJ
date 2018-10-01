import Api from '@/services/Api'

export default {
  getSongs () {
    return Api().get('/songs')
  },
  addSong (song) {
    return Api().post('/songs', song)
  },
  deleteSong (id) {
    return Api().delete('/songs', {id})
  }
}
