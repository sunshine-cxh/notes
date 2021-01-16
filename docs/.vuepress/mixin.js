import axios from 'axios'
export default {

  async mounted () {
    const token = localStorage.getItem('token')
    if (!token) {
      this.$router.replace('/login')
      return
    }
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3001/checkToken',
      data: {
        token
      }
    })
    if (res.data.status !== 200) {
      this.$msg.error(res.data.message)
      this.$router.replace('/login')
    }
  }
}