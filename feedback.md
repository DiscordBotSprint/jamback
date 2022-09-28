# Jamback

Awesome work this week friends -- I am super impressed with how deep you went with the Discord slash commands. I hope you all had fun building this - you should be proud! Here is some general feedback / notes:

- nice job finding the solution on the heroku issue - let me know if you want any help fixing that (although...Heroku free tier is ending soon so you may be better just finding an alternative hosting solution)
- You PagedReply class is really nice - you _could_ just pass all the attributes directly into the constructor, but it would perhaps make the code a little less clear? I like the way you did it with chaining the setter functions and I don't think it makes a big difference
- there are a few functions where destructuring will save you from a bunch of dot attr dot attr dot attr -- I marked them in the files
- I really don't have much feedback other than some nit-picky JS things - the models look good, nice work just connecting directly to postgres, and honestly the discord bot stuff is hard to make clean bc its just a bunch of callbacks but you all did a really excellent job pulling out the pieces you could into functions - great work!


