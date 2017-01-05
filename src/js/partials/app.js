jQuery(document).ready(function($) {
	$('.nav-tabs > li').first().addClass('active');
	$('.tab-content > *').first().addClass('active in');
	$('.comments-more').on('click', function() {
		var item = $('.comments-item'),
			list = $('.comments-list'),
			commentsCount = parseInt(item.length),
			commentsShow = list.data('total'),
			total = parseInt($('.comments-total').data('count'));

		if(commentsCount >= total) {
		    $(this).hide();
			return false;
		}

		for(var i = 0; i < parseInt(total-commentsCount) && i < commentsShow; i++) {
			list.append(item.first().clone());
		}

		if(parseInt(commentsCount + commentsShow) >= total) {
		    $(this).hide();
		}
	});
});